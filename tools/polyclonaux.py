#!/usr/bin/env python3

import sys
import os

AA = list("ACDEFGHIKLMNPQRSTVWYX")

def read_fasta_file(file_path: str, nb_aa_x: int) -> list:
    sequences = []
    current_name = ""
    current_sequence = []
    
    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('>'):
                if current_name and current_sequence:
                    # Remplace les espaces par des tirets et joint la séquence
                    # Ajoute nb_aa_x 'X' au début de la séquence
                    original_sequence = ''.join(current_sequence).replace(' ', '-')
                    full_sequence = 'X' * nb_aa_x + original_sequence
                    sequences.append((current_name, full_sequence))
                current_name = line[1:]  # Enlève le '>' et garde le reste
                current_sequence = []
            elif line:  # Si la ligne n'est pas vide
                current_sequence.append(line)
    
    # Ajoute la dernière séquence
    if current_name and current_sequence:
        # Remplace les espaces par des tirets et joint la séquence
        # Ajoute nb_aa_x 'X' au début de la séquence
        original_sequence = ''.join(current_sequence).replace(' ', '-')
        full_sequence = 'X' * nb_aa_x + original_sequence
        sequences.append((current_name, full_sequence))
    
    return sequences

def convert_sequence_to_numeric(sequence: str) -> list:
    """Convertit une séquence d'acides aminés en leurs indices numériques."""
    numeric = []
    for aa in sequence:
        if aa == '-':
            numeric.append(-1)  # Utilise -1 pour représenter les gaps
        else:
            numeric.append(AA.index(aa))
    return numeric

def format_alignment(name: str, sequence: str, numeric: list, width: int = 80) -> str:
    result = []
    
    result.append(f"\033[1;36m=== Conversion de la protéine : {name} ===\033[0m\n")
    
    for i in range(0, len(sequence), width):
        seq_line = sequence[i:i+width]
        num_line = numeric[i:i+width]
        
        pos_start = str(i + 1)
        pos_end = str(min(i + width, len(sequence)))
        result.append(f"\033[1;33mPosition: {pos_start.rjust(4)}-{pos_end.ljust(4)}\033[0m")
        
        result.append("┌" + "───┬" * (len(seq_line) - 1) + "───┐")
        
        seq_line_formatted = "│"
        for aa in seq_line:
            seq_line_formatted += f" {aa} │"
        result.append(seq_line_formatted)
        
        result.append("├" + "───┼" * (len(seq_line) - 1) + "───┤")
        
        num_line_formatted = "│"
        for num in num_line:
            if num == -1:
                num_line_formatted += "\033[1;37m - \033[0m│" 
            else:
                color = "\033[1;3" + str((num % 6) + 1) + "m"
                num_line_formatted += f"{color}{num:2d} \033[0m│"  # Aligne le numéro sur 2 caractères
        result.append(num_line_formatted)
        
        
        result.append("└" + "───┴" * (len(seq_line) - 1) + "───┘")
        result.append("")  
    
    return '\n'.join(result)

def main():
    print("\033[1;36m=== Outil de traitement de séquences FASTA avec ajout de X ===\033[0m\n")
    
    # Demande interactivement le fichier FASTA
    while True:
        sequence_file = input("Entrez le chemin du fichier FASTA : ").strip()
        if os.path.isfile(sequence_file):
            break
        else:
            print(f"\033[1;31mErreur: Le fichier '{sequence_file}' n'existe pas.\033[0m")
    
    # Demande interactivement le nombre de X à ajouter
    while True:
        try:
            nb_aa_x = int(input("Entrez le nombre d'acides aminés X à ajouter au début (par défaut 40) : ") or "40")
            if nb_aa_x >= 0:
                break
            else:
                print("\033[1;31mErreur: Le nombre doit être positif ou nul.\033[0m")
        except ValueError:
            print("\033[1;31mErreur: Veuillez entrer un nombre entier valide.\033[0m")
    
    print(f"\nTraitement du fichier '{sequence_file}' avec ajout de {nb_aa_x} acides aminés X...\n")
    
    try:
        sequences = read_fasta_file(sequence_file, nb_aa_x)
        
        for name, sequence in sequences:
            numeric = convert_sequence_to_numeric(sequence)
            
            # Affiche l'alignement
            print(format_alignment(name, sequence, numeric))
            
        # Affiche la légende à la fin
        print("\033[1;36m=== Légende ===\033[0m")
        legend = []
        for i, aa in enumerate(AA):
            color = "\033[1;3" + str((i % 6) + 1) + "m"
            legend.append(f"{color}{aa}={i}\033[0m")
        print(" ".join(legend))

        
    except Exception as e:
        print(f"\033[1;31mErreur lors de la conversion: {str(e)}\033[0m")
        sys.exit(1)

if __name__ == "__main__":
    main() 