#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_LINE 10000
#define MAX_SEQ 100000

void numeric_to_fasta(const char* input, char* output) {
    char* token;
    char* rest = strdup(input);
    char sequence[MAX_SEQ] = "";
    int num;
    
    while ((token = strtok_r(rest, " \n", &rest))) {
        num = atoi(token);
        if (num >= 0 && num < 26) {
            char letter = 'A' + num;
            strncat(sequence, &letter, 1);
        }
    }
    
    sprintf(output, ">seq\n%s\n", sequence);
    free(rest);
}

void fasta_to_numeric(const char* input, char* output) {
    char* line;
    char* rest = strdup(input);
    char numbers[MAX_SEQ] = "";
    char temp[10];
    
    while ((line = strtok_r(rest, "\n", &rest))) {
        if (line[0] != '>') {
            for (int i = 0; line[i]; i++) {
                if (isalpha(line[i])) {
                    int num = toupper(line[i]) - 'A';
                    sprintf(temp, "%d ", num);
                    strcat(numbers, temp);
                }
            }
        }
    }
    
    strcpy(output, numbers);
    free(rest);
}

int main(int argc, char* argv[]) {
    if (argc != 4) {
        printf("Usage: %s [to-fasta|to-numeric] input_file output_file\n", argv[0]);
        return 1;
    }
    
    char input_buffer[MAX_SEQ];
    char output_buffer[MAX_SEQ];
    FILE *fin, *fout;
    
    fin = fopen(argv[2], "r");
    if (!fin) {
        printf("Erreur: Impossible d'ouvrir le fichier d'entrée\n");
        return 1;
    }
    
    // Lire le fichier d'entrée
    size_t total = 0;
    while (fgets(input_buffer + total, MAX_SEQ - total, fin) != NULL) {
        total += strlen(input_buffer + total);
    }
    fclose(fin);
    
    // Conversion
    if (strcmp(argv[1], "to-fasta") == 0) {
        numeric_to_fasta(input_buffer, output_buffer);
    } else if (strcmp(argv[1], "to-numeric") == 0) {
        fasta_to_numeric(input_buffer, output_buffer);
    } else {
        printf("Mode invalide. Utilisez 'to-fasta' ou 'to-numeric'\n");
        return 1;
    }
    
    // Écrire le résultat
    fout = fopen(argv[3], "w");
    if (!fout) {
        printf("Erreur: Impossible d'ouvrir le fichier de sortie\n");
        return 1;
    }
    
    fprintf(fout, "%s", output_buffer);
    fclose(fout);
    
    return 0;
} 