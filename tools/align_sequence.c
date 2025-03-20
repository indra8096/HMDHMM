#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void format_alignment(char *name, char *sequence, int *numeric);


#define WIDTH 80 //longeur d'affichage
const char *AA = "ACDEFGHIKLMNPQRSTVWYX"; //21 AA 

typedef struct {
    char name[100];
    char *sequence;  //pointeur vers la séquence
} Sequence;


Sequence *read_fasta_file(const char *file_path, int *seq_count) {
    FILE *file = fopen(file_path, "r");
    if (!file) {
        perror("Erreur d'ouverture du fichier");
        exit(1);
    }

    Sequence *sequences = NULL;
    char line[256];
    char current_name[100] = "";
    char *current_sequence = NULL;
    int count = 0;

    while (fgets(line, sizeof(line), file)) {
        line[strcspn(line, "\n")] = '\0';  // Supprime le retour à la ligne

        if (line[0] == '>') {  // Début d'une nouvelle séquence
            if (current_sequence) {  // Sauvegarde de la séquence précédente
                sequences = realloc(sequences, (count + 1) * sizeof(Sequence));
                strcpy(sequences[count].name, current_name);
                sequences[count].sequence = current_sequence;
                count++;
            }

            strcpy(current_name, line + 1);
            current_sequence = malloc(1);
            current_sequence[0] = '\0';
        } else {  // Ajoute la ligne à la séquence actuelle
            size_t len = strlen(current_sequence);
            current_sequence = realloc(current_sequence, len + strlen(line) + 1);
            strcat(current_sequence, line);
        }
    }

    // Sauvegarde la dernière séquence
    if (current_sequence) {
        sequences = realloc(sequences, (count + 1) * sizeof(Sequence));
        strcpy(sequences[count].name, current_name);
        sequences[count].sequence = current_sequence;
        count++;
    }

    fclose(file);
    *seq_count = count;
    return sequences;
}

int *convert_sequence_to_numeric(const char *sequence) {
    int *numeric = malloc(strlen(sequence) * sizeof(int));

    for (size_t i = 0; i < strlen(sequence); i++) {
        if (sequence[i] == '-') {
            numeric[i] = -1;  // Gap
        } else {
            char *pos = strchr(AA, sequence[i]);
            numeric[i] = (pos) ? pos - AA : -1;  // Index de l'acide aminé
        }
    }

    return numeric;
}

void format_alignment(char *name, char *sequence, int *numeric) {
    int len = strlen(sequence);
    
    // En-tête avec le nom de la protéine
    printf("\033[1;36m=== Conversion de la protéine : %s ===\033[0m\n\n", name);
    
    // Affiche la séquence par blocs de WIDTH caractères
    for (int i = 0; i < len; i += WIDTH) {
        int block_len = (len - i < WIDTH) ? len - i : WIDTH;
        
        // Numéros de position
        printf("\033[1;33mPosition: %4d-%-4d\033[0m\n", i + 1, i + block_len);
        
        // Ligne supérieure du tableau
        printf("┌");
        for (int j = 0; j < block_len - 1; j++) {
            printf("───┬");
        }
        printf("───┐\n");
        
        // Ligne des séquences
        printf("│");
        for (int j = 0; j < block_len; j++) {
            printf(" %c │", sequence[i + j]);
        }
        printf("\n");
        
        // Ligne de séparation
        printf("├");
        for (int j = 0; j < block_len - 1; j++) {
            printf("───┼");
        }
        printf("───┤\n");
        
        // Ligne des indices
        printf("│");
        for (int j = 0; j < block_len; j++) {
            int num = numeric[i + j];
            if (num == -1) {
                printf("\033[1;37m - \033[0m│");
            } else {
                printf("\033[1;3%dm%2d \033[0m│", (num % 6) + 1, num);
            }
        }
        printf("\n");
        
        // Ligne inférieure du tableau
        printf("└");
        for (int j = 0; j < block_len - 1; j++) {
            printf("───┴");
        }
        printf("───┘\n\n");
    }
}

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <fichier_fasta>\n", argv[0]);
        return 1;
    }

    int seq_count;
    Sequence *sequences = read_fasta_file(argv[1], &seq_count);

    for (int i = 0; i < seq_count; i++) {
        int *numeric = convert_sequence_to_numeric(sequences[i].sequence);
        format_alignment(sequences[i].name, sequences[i].sequence, numeric);
        free(numeric);
        free(sequences[i].sequence);
    }

    free(sequences);
    return 0;
}

    
