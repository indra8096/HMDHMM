#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>

#define MAX_SEQUENCE_LENGTH 10000

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

// Conversion d'état en couleur CSS
const char* state_to_color(State state) {
    switch (state) {
        case TERRE: return "#28a745"; // vert
        case LUNE: return "#17a2b8";  // bleu
        case MARS: return "#dc3545";  // rouge
        default: return "#6c757d";    // gris
    }
}

// Matrice de transition par défaut
// transitions[état_courant][état_suivant] = probabilité
double transitions[NUM_STATES][NUM_STATES] = {
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

// Fonction pour calculer les statistiques cumulatives
void calculate_cumulative_stats(State *sequence, int length, double **stats) {
    int counts[NUM_STATES] = {0};
    
    // Pour chaque étape, calculer les stats cumulatives
    for (int i = 0; i < length; i++) {
        // Incrémenter le compteur pour l'état actuel
        counts[sequence[i]]++;
        
        // Calculer les probabilités pour chaque état
        for (int j = 0; j < NUM_STATES; j++) {
            stats[i][j] = (double)counts[j] / (i + 1);
        }
    }
}

// Fonction pour générer un fichier HTML avec une visualisation
void generate_html_visualization(State *sequence, int length, double **stats, int initial_state, const char *filename) {
    FILE *fp = fopen(filename, "w");
    if (!fp) {
        fprintf(stderr, "Erreur lors de l'ouverture du fichier %s\n", filename);
        return;
    }
    
    // Écrire l'en-tête HTML
    fprintf(fp, "<!DOCTYPE html>\n");
    fprintf(fp, "<html lang=\"fr\">\n");
    fprintf(fp, "<head>\n");
    fprintf(fp, "    <meta charset=\"UTF-8\">\n");
    fprintf(fp, "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
    fprintf(fp, "    <title>Simulation d'une chaîne de Markov sur %d étapes</title>\n", length);
    fprintf(fp, "    <script src=\"https://cdn.jsdelivr.net/npm/chart.js\"></script>\n");
    fprintf(fp, "    <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\">\n");
    fprintf(fp, "    <style>\n");
    fprintf(fp, "        .state-indicator {\n");
    fprintf(fp, "            width: 2px;\n");
    fprintf(fp, "            height: 20px;\n");
    fprintf(fp, "            display: inline-block;\n");
    fprintf(fp, "            margin: 0;\n");
    fprintf(fp, "            padding: 0;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .controls {\n");
    fprintf(fp, "            margin: 20px 0;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .slider-container {\n");
    fprintf(fp, "            display: flex;\n");
    fprintf(fp, "            align-items: center;\n");
    fprintf(fp, "            margin-bottom: 10px;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .slider-container label {\n");
    fprintf(fp, "            margin-right: 10px;\n");
    fprintf(fp, "            width: 150px;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .slider-value {\n");
    fprintf(fp, "            margin-left: 10px;\n");
    fprintf(fp, "            width: 50px;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .state-sequence {\n");
    fprintf(fp, "            overflow-x: auto;\n");
    fprintf(fp, "            white-space: nowrap;\n");
    fprintf(fp, "            margin: 10px 0;\n");
    fprintf(fp, "            height: 30px;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .chart-container {\n");
    fprintf(fp, "            position: relative;\n");
    fprintf(fp, "            height: 400px;\n");
    fprintf(fp, "            margin-top: 20px;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .terminal {\n");
    fprintf(fp, "            background-color: #000;\n");
    fprintf(fp, "            color: #00ff00;\n");
    fprintf(fp, "            font-family: 'Courier New', monospace;\n");
    fprintf(fp, "            padding: 10px;\n");
    fprintf(fp, "            border-radius: 5px;\n");
    fprintf(fp, "            height: 200px;\n");
    fprintf(fp, "            overflow-y: auto;\n");
    fprintf(fp, "            margin-top: 20px;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .terminal-line {\n");
    fprintf(fp, "            margin: 0;\n");
    fprintf(fp, "            line-height: 1.2;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .terminal-prompt {\n");
    fprintf(fp, "            color: #0088ff;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .terra {\n");
    fprintf(fp, "            color: #28a745;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .lune {\n");
    fprintf(fp, "            color: #17a2b8;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .mars {\n");
    fprintf(fp, "            color: #dc3545;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "    </style>\n");
    fprintf(fp, "</head>\n");
    fprintf(fp, "<body>\n");
    fprintf(fp, "    <div class=\"container mt-4\">\n");
    fprintf(fp, "        <h1>Simulation d'une chaîne de Markov sur %d étapes</h1>\n", length);
    fprintf(fp, "        <p><strong>État initial :</strong> %s</p>\n", state_to_string(initial_state));
    
    // Contrôles
    fprintf(fp, "        <div class=\"card\">\n");
    fprintf(fp, "            <div class=\"card-body\">\n");
    fprintf(fp, "                <h5 class=\"card-title\">Contrôles de la simulation</h5>\n");
    fprintf(fp, "                <div class=\"controls\">\n");
    fprintf(fp, "                    <div class=\"slider-container\">\n");
    fprintf(fp, "                        <label for=\"speedSlider\">Vitesse de simulation :</label>\n");
    fprintf(fp, "                        <input type=\"range\" id=\"speedSlider\" min=\"1\" max=\"100\" value=\"50\" class=\"form-range\">\n");
    fprintf(fp, "                        <span class=\"slider-value\" id=\"speedValue\">50</span>\n");
    fprintf(fp, "                    </div>\n");
    fprintf(fp, "                    <div class=\"slider-container\">\n");
    fprintf(fp, "                        <label for=\"stepSlider\">Étape actuelle :</label>\n");
    fprintf(fp, "                        <input type=\"range\" id=\"stepSlider\" min=\"1\" max=\"%d\" value=\"1\" class=\"form-range\">\n", length);
    fprintf(fp, "                        <span class=\"slider-value\" id=\"stepValue\">1</span>\n");
    fprintf(fp, "                    </div>\n");
    fprintf(fp, "                    <div class=\"d-flex gap-2\">\n");
    fprintf(fp, "                        <button id=\"playButton\" class=\"btn btn-primary\">Lecture</button>\n");
    fprintf(fp, "                        <button id=\"pauseButton\" class=\"btn btn-secondary\">Pause</button>\n");
    fprintf(fp, "                        <button id=\"resetButton\" class=\"btn btn-danger\">Réinitialiser</button>\n");
    fprintf(fp, "                    </div>\n");
    fprintf(fp, "                </div>\n");
    fprintf(fp, "            </div>\n");
    fprintf(fp, "        </div>\n");

    // Terminal pour afficher les transitions en temps réel
    fprintf(fp, "        <div class=\"card mt-4\">\n");
    fprintf(fp, "            <div class=\"card-body\">\n");
    fprintf(fp, "                <h5 class=\"card-title\">Terminal en temps réel</h5>\n");
    fprintf(fp, "                <div class=\"terminal\" id=\"terminal\">\n");
    fprintf(fp, "                    <p class=\"terminal-line\"><span class=\"terminal-prompt\">robot@cosmos:~$</span> ./simulate_markov.sh %s %d</p>\n", state_to_string(initial_state), length);
    fprintf(fp, "                    <p class=\"terminal-line\">Initialisation de la simulation avec état initial: <span class=\"%s\">%s</span></p>\n", 
            (strcmp(state_to_string(initial_state), "Terre") == 0) ? "terra" : 
            ((strcmp(state_to_string(initial_state), "Lune") == 0) ? "lune" : "mars"), 
            state_to_string(initial_state));
    fprintf(fp, "                    <p class=\"terminal-line\">Début de la simulation...</p>\n");
    fprintf(fp, "                </div>\n");
    fprintf(fp, "            </div>\n");
    fprintf(fp, "        </div>\n");

    // Séquence d'états
    fprintf(fp, "        <div class=\"card mt-4\">\n");
    fprintf(fp, "            <div class=\"card-body\">\n");
    fprintf(fp, "                <h5 class=\"card-title\">Séquence d'états</h5>\n");
    fprintf(fp, "                <div class=\"state-sequence\" id=\"stateSequence\">\n");
    for (int i = 0; i < length; i++) {
        fprintf(fp, "                    <div class=\"state-indicator\" id=\"state-%d\" style=\"background-color: %s;\"></div>\n", 
                i, state_to_color(sequence[i]));
    }
    fprintf(fp, "                </div>\n");
    fprintf(fp, "                <div class=\"mt-2\">\n");
    fprintf(fp, "                    <span class=\"badge bg-success me-2\">Terre</span>\n");
    fprintf(fp, "                    <span class=\"badge bg-info me-2\">Lune</span>\n");
    fprintf(fp, "                    <span class=\"badge bg-danger me-2\">Mars</span>\n");
    fprintf(fp, "                </div>\n");
    fprintf(fp, "            </div>\n");
    fprintf(fp, "        </div>\n");

    // Statistiques
    fprintf(fp, "        <div class=\"card mt-4\">\n");
    fprintf(fp, "            <div class=\"card-body\">\n");
    fprintf(fp, "                <h5 class=\"card-title\">Évolution des probabilités</h5>\n");
    fprintf(fp, "                <div class=\"chart-container\">\n");
    fprintf(fp, "                    <canvas id=\"statsChart\"></canvas>\n");
    fprintf(fp, "                </div>\n");
    fprintf(fp, "                <div class=\"row mt-4\">\n");
    fprintf(fp, "                    <div class=\"col-md-4\">\n");
    fprintf(fp, "                        <div class=\"card bg-success text-white\">\n");
    fprintf(fp, "                            <div class=\"card-body\">\n");
    fprintf(fp, "                                <h5 class=\"card-title\">Terre</h5>\n");
    fprintf(fp, "                                <p class=\"card-text fs-4\" id=\"terreStat\">0.00</p>\n");
    fprintf(fp, "                            </div>\n");
    fprintf(fp, "                        </div>\n");
    fprintf(fp, "                    </div>\n");
    fprintf(fp, "                    <div class=\"col-md-4\">\n");
    fprintf(fp, "                        <div class=\"card bg-info text-white\">\n");
    fprintf(fp, "                            <div class=\"card-body\">\n");
    fprintf(fp, "                                <h5 class=\"card-title\">Lune</h5>\n");
    fprintf(fp, "                                <p class=\"card-text fs-4\" id=\"luneStat\">0.00</p>\n");
    fprintf(fp, "                            </div>\n");
    fprintf(fp, "                        </div>\n");
    fprintf(fp, "                    </div>\n");
    fprintf(fp, "                    <div class=\"col-md-4\">\n");
    fprintf(fp, "                        <div class=\"card bg-danger text-white\">\n");
    fprintf(fp, "                            <div class=\"card-body\">\n");
    fprintf(fp, "                                <h5 class=\"card-title\">Mars</h5>\n");
    fprintf(fp, "                                <p class=\"card-text fs-4\" id=\"marsStat\">0.00</p>\n");
    fprintf(fp, "                            </div>\n");
    fprintf(fp, "                        </div>\n");
    fprintf(fp, "                    </div>\n");
    fprintf(fp, "                </div>\n");
    fprintf(fp, "            </div>\n");
    fprintf(fp, "        </div>\n");
    
    // Données JavaScript
    fprintf(fp, "        <script>\n");
    fprintf(fp, "            // Données de la séquence\n");
    fprintf(fp, "            const sequence = [\n");
    for (int i = 0; i < length; i++) {
        fprintf(fp, "                %d%s\n", sequence[i], (i < length - 1) ? "," : "");
    }
    fprintf(fp, "            ];\n\n");
    
    fprintf(fp, "            // Données des statistiques cumulatives\n");
    fprintf(fp, "            const cumulativeStats = [\n");
    for (int i = 0; i < length; i++) {
        fprintf(fp, "                [%f, %f, %f]%s\n", 
                stats[i][0], stats[i][1], stats[i][2], 
                (i < length - 1) ? "," : "");
    }
    fprintf(fp, "            ];\n\n");
    
    // Script JavaScript pour la visualisation
    fprintf(fp, "            // Éléments DOM\n");
    fprintf(fp, "            const speedSlider = document.getElementById('speedSlider');\n");
    fprintf(fp, "            const speedValue = document.getElementById('speedValue');\n");
    fprintf(fp, "            const stepSlider = document.getElementById('stepSlider');\n");
    fprintf(fp, "            const stepValue = document.getElementById('stepValue');\n");
    fprintf(fp, "            const playButton = document.getElementById('playButton');\n");
    fprintf(fp, "            const pauseButton = document.getElementById('pauseButton');\n");
    fprintf(fp, "            const resetButton = document.getElementById('resetButton');\n");
    fprintf(fp, "            const terminal = document.getElementById('terminal');\n");
    fprintf(fp, "            const terreStat = document.getElementById('terreStat');\n");
    fprintf(fp, "            const luneStat = document.getElementById('luneStat');\n");
    fprintf(fp, "            const marsStat = document.getElementById('marsStat');\n");
    
    fprintf(fp, "            // Couleurs pour le graphique\n");
    fprintf(fp, "            const colors = ['#28a745', '#17a2b8', '#dc3545'];\n");
    fprintf(fp, "            const labels = ['Terre', 'Lune', 'Mars'];\n");
    
    fprintf(fp, "            // Configuration du graphique\n");
    fprintf(fp, "            const ctx = document.getElementById('statsChart').getContext('2d');\n");
    fprintf(fp, "            const chart = new Chart(ctx, {\n");
    fprintf(fp, "                type: 'line',\n");
    fprintf(fp, "                data: {\n");
    fprintf(fp, "                    labels: Array.from({length: %d}, (_, i) => i + 1),\n", length);
    fprintf(fp, "                    datasets: [\n");
    fprintf(fp, "                        {\n");
    fprintf(fp, "                            label: 'Terre',\n");
    fprintf(fp, "                            data: cumulativeStats.map(stat => stat[0]),\n");
    fprintf(fp, "                            borderColor: colors[0],\n");
    fprintf(fp, "                            backgroundColor: colors[0] + '33',\n");
    fprintf(fp, "                            tension: 0.1\n");
    fprintf(fp, "                        },\n");
    fprintf(fp, "                        {\n");
    fprintf(fp, "                            label: 'Lune',\n");
    fprintf(fp, "                            data: cumulativeStats.map(stat => stat[1]),\n");
    fprintf(fp, "                            borderColor: colors[1],\n");
    fprintf(fp, "                            backgroundColor: colors[1] + '33',\n");
    fprintf(fp, "                            tension: 0.1\n");
    fprintf(fp, "                        },\n");
    fprintf(fp, "                        {\n");
    fprintf(fp, "                            label: 'Mars',\n");
    fprintf(fp, "                            data: cumulativeStats.map(stat => stat[2]),\n");
    fprintf(fp, "                            borderColor: colors[2],\n");
    fprintf(fp, "                            backgroundColor: colors[2] + '33',\n");
    fprintf(fp, "                            tension: 0.1\n");
    fprintf(fp, "                        }\n");
    fprintf(fp, "                    ]\n");
    fprintf(fp, "                },\n");
    fprintf(fp, "                options: {\n");
    fprintf(fp, "                    animation: false,\n");
    fprintf(fp, "                    scales: {\n");
    fprintf(fp, "                        y: {\n");
    fprintf(fp, "                            min: 0,\n");
    fprintf(fp, "                            max: 1,\n");
    fprintf(fp, "                            title: {\n");
    fprintf(fp, "                                display: true,\n");
    fprintf(fp, "                                text: 'Probabilité'\n");
    fprintf(fp, "                            }\n");
    fprintf(fp, "                        },\n");
    fprintf(fp, "                        x: {\n");
    fprintf(fp, "                            title: {\n");
    fprintf(fp, "                                display: true,\n");
    fprintf(fp, "                                text: 'Étape'\n");
    fprintf(fp, "                            }\n");
    fprintf(fp, "                        }\n");
    fprintf(fp, "                    },\n");
    fprintf(fp, "                    plugins: {\n");
    fprintf(fp, "                        tooltip: {\n");
    fprintf(fp, "                            mode: 'index',\n");
    fprintf(fp, "                            intersect: false\n");
    fprintf(fp, "                        }\n");
    fprintf(fp, "                    }\n");
    fprintf(fp, "                }\n");
    fprintf(fp, "            });\n\n");
    
    fprintf(fp, "            // Variables pour l'animation\n");
    fprintf(fp, "            let currentStep = 0;\n");
    fprintf(fp, "            let isPlaying = false;\n");
    fprintf(fp, "            let animationInterval;\n");
    fprintf(fp, "            let speed = 50; // ms par étape\n\n");

    fprintf(fp, "            // Fonction pour ajouter une ligne au terminal\n");
    fprintf(fp, "            function addTerminalLine(text, className = '') {\n");
    fprintf(fp, "                const line = document.createElement('p');\n");
    fprintf(fp, "                line.className = 'terminal-line';\n");
    fprintf(fp, "                if (className) {\n");
    fprintf(fp, "                    line.innerHTML = `Étape ${currentStep + 1}: <span class=\"${className}\">${text}</span>`;\n");
    fprintf(fp, "                } else {\n");
    fprintf(fp, "                    line.textContent = text;\n");
    fprintf(fp, "                }\n");
    fprintf(fp, "                terminal.appendChild(line);\n");
    fprintf(fp, "                terminal.scrollTop = terminal.scrollHeight;\n");
    fprintf(fp, "            }\n\n");

    fprintf(fp, "            // Fonction pour obtenir la classe CSS pour un état\n");
    fprintf(fp, "            function getStateClass(state) {\n");
    fprintf(fp, "                switch(state) {\n");
    fprintf(fp, "                    case 0: return 'terra';\n");
    fprintf(fp, "                    case 1: return 'lune';\n");
    fprintf(fp, "                    case 2: return 'mars';\n");
    fprintf(fp, "                    default: return '';\n");
    fprintf(fp, "                }\n");
    fprintf(fp, "            }\n\n");

    fprintf(fp, "            // Fonction pour obtenir le nom d'un état\n");
    fprintf(fp, "            function getStateName(state) {\n");
    fprintf(fp, "                switch(state) {\n");
    fprintf(fp, "                    case 0: return 'Terre';\n");
    fprintf(fp, "                    case 1: return 'Lune';\n");
    fprintf(fp, "                    case 2: return 'Mars';\n");
    fprintf(fp, "                    default: return 'Inconnu';\n");
    fprintf(fp, "                }\n");
    fprintf(fp, "            }\n\n");
    
    fprintf(fp, "            // Fonction pour mettre à jour l'affichage à une étape donnée\n");
    fprintf(fp, "            function updateDisplay(step) {\n");
    fprintf(fp, "                // Mettre à jour le slider\n");
    fprintf(fp, "                stepSlider.value = step + 1;\n");
    fprintf(fp, "                stepValue.textContent = step + 1;\n\n");
    
    fprintf(fp, "                // Mettre à jour les statistiques\n");
    fprintf(fp, "                terreStat.textContent = cumulativeStats[step][0].toFixed(2);\n");
    fprintf(fp, "                luneStat.textContent = cumulativeStats[step][1].toFixed(2);\n");
    fprintf(fp, "                marsStat.textContent = cumulativeStats[step][2].toFixed(2);\n\n");
    
    fprintf(fp, "                // Mettre à jour le graphique\n");
    fprintf(fp, "                chart.data.datasets.forEach((dataset, i) => {\n");
    fprintf(fp, "                    dataset.data = cumulativeStats.slice(0, step + 1).map(stat => stat[i]);\n");
    fprintf(fp, "                });\n");
    fprintf(fp, "                chart.data.labels = Array.from({length: step + 1}, (_, i) => i + 1);\n");
    fprintf(fp, "                chart.update();\n\n");
    
    fprintf(fp, "                // Mettre en évidence l'état actuel dans la séquence\n");
    fprintf(fp, "                document.querySelectorAll('.state-indicator').forEach((el, i) => {\n");
    fprintf(fp, "                    if (i <= step) {\n");
    fprintf(fp, "                        el.style.opacity = '1';\n");
    fprintf(fp, "                    } else {\n");
    fprintf(fp, "                        el.style.opacity = '0.2';\n");
    fprintf(fp, "                    }\n");
    fprintf(fp, "                });\n");
    
    fprintf(fp, "                // Ajouter une ligne au terminal si c'est une nouvelle étape\n");
    fprintf(fp, "                if (step > 0) {\n");
    fprintf(fp, "                    const prevState = sequence[step-1];\n");
    fprintf(fp, "                    const currentState = sequence[step];\n");
    fprintf(fp, "                    const prevStateName = getStateName(prevState);\n");
    fprintf(fp, "                    const currentStateName = getStateName(currentState);\n");
    fprintf(fp, "                    const stateClass = getStateClass(currentState);\n");
    fprintf(fp, "                    \n");
    fprintf(fp, "                    const text = `Transition: ${prevStateName} → ${currentStateName}`;\n");
    fprintf(fp, "                    addTerminalLine(text, stateClass);\n");
    fprintf(fp, "                }\n");
    fprintf(fp, "            }\n\n");
    
    fprintf(fp, "            // Fonction pour jouer l'animation\n");
    fprintf(fp, "            function playSim() {\n");
    fprintf(fp, "                if (isPlaying) return;\n");
    fprintf(fp, "                isPlaying = true;\n");
    fprintf(fp, "                \n");
    fprintf(fp, "                if (currentStep === 0) {\n");
    fprintf(fp, "                    // Ajouter la ligne initiale au terminal\n");
    fprintf(fp, "                    const initialState = sequence[0];\n");
    fprintf(fp, "                    const stateName = getStateName(initialState);\n");
    fprintf(fp, "                    const stateClass = getStateClass(initialState);\n");
    fprintf(fp, "                    addTerminalLine(`État initial: ${stateName}`, stateClass);\n");
    fprintf(fp, "                }\n");
    
    fprintf(fp, "                animationInterval = setInterval(() => {\n");
    fprintf(fp, "                    if (currentStep < %d - 1) {\n", length);
    fprintf(fp, "                        currentStep++;\n");
    fprintf(fp, "                        updateDisplay(currentStep);\n");
    fprintf(fp, "                    } else {\n");
    fprintf(fp, "                        clearInterval(animationInterval);\n");
    fprintf(fp, "                        isPlaying = false;\n");
    fprintf(fp, "                        addTerminalLine('Simulation terminée.', '');\n");
    fprintf(fp, "                    }\n");
    fprintf(fp, "                }, 105 - speed);\n");
    fprintf(fp, "            }\n\n");
    
    fprintf(fp, "            // Fonction pour mettre en pause l'animation\n");
    fprintf(fp, "            function pauseSim() {\n");
    fprintf(fp, "                if (!isPlaying) return;\n");
    fprintf(fp, "                clearInterval(animationInterval);\n");
    fprintf(fp, "                isPlaying = false;\n");
    fprintf(fp, "                addTerminalLine('Simulation en pause.', '');\n");
    fprintf(fp, "            }\n\n");
    
    fprintf(fp, "            // Fonction pour réinitialiser l'animation\n");
    fprintf(fp, "            function resetSim() {\n");
    fprintf(fp, "                pauseSim();\n");
    fprintf(fp, "                currentStep = 0;\n");
    fprintf(fp, "                updateDisplay(currentStep);\n");
    fprintf(fp, "                \n");
    fprintf(fp, "                // Effacer le terminal sauf les premières lignes d'initialisation\n");
    fprintf(fp, "                while (terminal.childElementCount > 3) {\n");
    fprintf(fp, "                    terminal.removeChild(terminal.lastChild);\n");
    fprintf(fp, "                }\n");
    fprintf(fp, "                addTerminalLine('Simulation réinitialisée.', '');\n");
    fprintf(fp, "            }\n\n");
    
    fprintf(fp, "            // Gestionnaires d'événements\n");
    fprintf(fp, "            playButton.addEventListener('click', playSim);\n");
    fprintf(fp, "            pauseButton.addEventListener('click', pauseSim);\n");
    fprintf(fp, "            resetButton.addEventListener('click', resetSim);\n\n");
    
    fprintf(fp, "            speedSlider.addEventListener('input', (e) => {\n");
    fprintf(fp, "                speed = e.target.value;\n");
    fprintf(fp, "                speedValue.textContent = speed;\n");
    fprintf(fp, "                if (isPlaying) {\n");
    fprintf(fp, "                    pauseSim();\n");
    fprintf(fp, "                    playSim();\n");
    fprintf(fp, "                }\n");
    fprintf(fp, "            });\n\n");
    
    fprintf(fp, "            stepSlider.addEventListener('input', (e) => {\n");
    fprintf(fp, "                pauseSim();\n");
    fprintf(fp, "                currentStep = parseInt(e.target.value) - 1;\n");
    fprintf(fp, "                updateDisplay(currentStep);\n");
    fprintf(fp, "            });\n\n");
    
    // Initialiser l'affichage
    fprintf(fp, "            resetSim();\n");
    fprintf(fp, "        </script>\n");
    
    fprintf(fp, "    </div>\n");
    fprintf(fp, "</body>\n");
    fprintf(fp, "</html>\n");
    
    fclose(fp);
}

void print_usage(const char *prog_name) {
    fprintf(stderr, "Usage: %s <initial_state> <sequence_length> <output_file> [<transition_matrix>]\n", prog_name);
    fprintf(stderr, "  <initial_state>: 0=Terre, 1=Lune, 2=Mars\n");
    fprintf(stderr, "  <sequence_length>: longueur de la séquence (max %d)\n", MAX_SEQUENCE_LENGTH);
    fprintf(stderr, "  <output_file>: fichier HTML de sortie\n");
    fprintf(stderr, "  <transition_matrix>: (optionnel) 9 valeurs pour la matrice de transition\n");
    fprintf(stderr, "                       format: T->T,T->L,T->M,L->T,L->L,L->M,M->T,M->L,M->M\n");
    fprintf(stderr, "                       exemple: 0.0,0.6,0.4,0.0,0.8,0.2,0.0,0.6,0.4\n");
}

int main(int argc, char *argv[]) {
    if (argc < 4) {
        print_usage(argv[0]);
        return 1;
    }
    
    int initial_state = atoi(argv[1]);
    int length = atoi(argv[2]);
    const char *output_file = argv[3];
    
    if (initial_state < 0 || initial_state >= NUM_STATES) {
        fprintf(stderr, "État initial invalide. Doit être entre 0 et %d\n", NUM_STATES - 1);
        return 1;
    }
    
    if (length <= 0 || length > MAX_SEQUENCE_LENGTH) {
        fprintf(stderr, "Longueur de séquence invalide. Doit être entre 1 et %d\n", MAX_SEQUENCE_LENGTH);
        return 1;
    }
    
    // Si une matrice de transition personnalisée est fournie
    if (argc >= 5) {
        char *transition_str = argv[4];
        char *token;
        char *saveptr;
        int row = 0, col = 0;
        
        // Analyser la chaîne pour obtenir les 9 valeurs
        token = strtok_r(transition_str, ",", &saveptr);
        while (token != NULL && row < NUM_STATES) {
            transitions[row][col] = atof(token);
            col++;
            
            if (col >= NUM_STATES) {
                col = 0;
                row++;
            }
            
            token = strtok_r(NULL, ",", &saveptr);
        }
        
        // Vérifier que chaque ligne de la matrice a une somme de 1.0
        for (int i = 0; i < NUM_STATES; i++) {
            double sum = 0.0;
            for (int j = 0; j < NUM_STATES; j++) {
                sum += transitions[i][j];
            }
            
            // Tolérance pour les erreurs d'arrondi
            if (sum < 0.99 || sum > 1.01) {
                fprintf(stderr, "Avertissement: La somme des probabilités pour l'état %s est %f (attendu: 1.0)\n", 
                        state_to_string(i), sum);
                // Normaliser les probabilités si nécessaire
                for (int j = 0; j < NUM_STATES; j++) {
                    transitions[i][j] /= sum;
                }
            }
        }
        
        // Afficher la matrice de transition utilisée
        printf("Matrice de transition utilisée:\n");
        for (int i = 0; i < NUM_STATES; i++) {
            printf("%s -> ", state_to_string(i));
            for (int j = 0; j < NUM_STATES; j++) {
                printf("%s: %.2f  ", state_to_string(j), transitions[i][j]);
            }
            printf("\n");
        }
    }
    
    // Initialiser le générateur de nombres aléatoires
    srand(time(NULL));
    
    // Générer la séquence
    State *sequence = (State *)malloc(length * sizeof(State));
    if (!sequence) {
        fprintf(stderr, "Erreur d'allocation mémoire pour la séquence\n");
        return 1;
    }
    generate_sequence(initial_state, length, sequence);
    
    // Allouer de la mémoire pour les statistiques cumulatives
    double **stats = (double **)malloc(length * sizeof(double *));
    if (!stats) {
        fprintf(stderr, "Erreur d'allocation mémoire pour les statistiques\n");
        free(sequence);
        return 1;
    }
    
    for (int i = 0; i < length; i++) {
        stats[i] = (double *)malloc(NUM_STATES * sizeof(double));
        if (!stats[i]) {
            fprintf(stderr, "Erreur d'allocation mémoire pour les statistiques à l'étape %d\n", i);
            // Libérer la mémoire allouée jusqu'à présent
            for (int j = 0; j < i; j++) {
                free(stats[j]);
            }
            free(stats);
            free(sequence);
            return 1;
        }
    }
    
    // Calculer les statistiques cumulatives
    calculate_cumulative_stats(sequence, length, stats);
    
    // Générer la visualisation HTML
    generate_html_visualization(sequence, length, stats, initial_state, output_file);
    
    // Libérer la mémoire
    for (int i = 0; i < length; i++) {
        free(stats[i]);
    }
    free(stats);
    free(sequence);
    
    printf("Visualisation générée avec succès dans le fichier %s\n", output_file);
    
    return 0;
} 