#!/bin/bash

# Vérifier si les paramètres sont fournis
if [ $# -lt 2 ]; then
    echo "Usage: $0 <etat_initial> <longueur_sequence>"
    echo "  <etat_initial>: 0=Terre, 1=Lune, 2=Mars"
    echo "  <longueur_sequence>: longueur de la séquence (max 100)"
    exit 1
fi

# Vérifier si le programme est compilé
if [ ! -f "./generate_markov_sequence" ]; then
    echo "Compilation du programme..."
    make
fi

# Exécuter le programme
./generate_markov_sequence "$1" "$2" 