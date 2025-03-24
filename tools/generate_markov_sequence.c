#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>

#define MAX_SEQUENCE_LENGTH 100

// États possibles
typedef enum {
    TERRE = 0,
    LUNE = 1,
    MARS = 2,
    NUM_STATES = 3
} State;

// Conversion d'état en chaîne pour l'affichage
const char* state_to_string(State state) {
    switch (state) {
        case TERRE: return "Terre";
        case LUNE: return "Lune";
        case MARS: return "Mars";
        default: return "Inconnu";
    }
}

// Matrice de transition
// transitions[état_courant][état_suivant] = probabilité
const double transitions[NUM_STATES][NUM_STATES] = {
    {0.0, 0.6, 0.4}, // De TERRE vers {TERRE, LUNE, MARS}
    {0.0, 0.8, 0.2}, // De LUNE vers {TERRE, LUNE, MARS}
    {0.0, 0.6, 0.4}  // De MARS vers {TERRE, LUNE, MARS}
};

// Fonction pour choisir le prochain état en utilisant la matrice de transition
State next_state(State current_state) {
    double r = (double)rand() / RAND_MAX;
    double cumulative_prob = 0.0;
    
    for (int next = 0; next < NUM_STATES; next++) {
        cumulative_prob += transitions[current_state][next];
        if (r < cumulative_prob) {
            return next;
        }
    }
    
    // En cas d'erreur d'arrondi, retourner le dernier état
    return NUM_STATES - 1;
}

// Fonction pour générer une séquence aléatoire à partir d'un état initial
void generate_sequence(State initial_state, int length, State *sequence) {
    sequence[0] = initial_state;
    
    for (int i = 1; i < length; i++) {
        sequence[i] = next_state(sequence[i-1]);
    }
}

int main(int argc, char *argv[]) {
    if (argc < 3) {
        fprintf(stderr, "Usage: %s <initial_state> <sequence_length>\n", argv[0]);
        fprintf(stderr, "  <initial_state>: 0=Terre, 1=Lune, 2=Mars\n");
        fprintf(stderr, "  <sequence_length>: longueur de la séquence (max %d)\n", MAX_SEQUENCE_LENGTH);
        return 1;
    }
    
    int initial_state = atoi(argv[1]);
    int length = atoi(argv[2]);
    
    if (initial_state < 0 || initial_state >= NUM_STATES) {
        fprintf(stderr, "État initial invalide. Doit être entre 0 et %d\n", NUM_STATES - 1);
        return 1;
    }
    
    if (length <= 0 || length > MAX_SEQUENCE_LENGTH) {
        fprintf(stderr, "Longueur de séquence invalide. Doit être entre 1 et %d\n", MAX_SEQUENCE_LENGTH);
        return 1;
    }
    
    // Initialiser le générateur de nombres aléatoires
    srand(time(NULL));
    
    // Générer la séquence
    State sequence[MAX_SEQUENCE_LENGTH];
    generate_sequence(initial_state, length, sequence);
    
    // Afficher la séquence sous forme JSON pour faciliter l'intégration web
    printf("{\n");
    printf("  \"sequence\": [\n");
    for (int i = 0; i < length; i++) {
        printf("    {\n");
        printf("      \"day\": %d,\n", i + 1);
        printf("      \"state\": \"%s\",\n", state_to_string(sequence[i]));
        printf("      \"stateCode\": %d\n", sequence[i]);
        printf("    }%s\n", (i < length - 1) ? "," : "");
    }
    printf("  ]\n");
    printf("}\n");
    
    return 0;
} 