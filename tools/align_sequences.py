#!/usr/bin/env python3

import sys

AA = list("ACDEFGHIKLMNPQRSTVWYX")

def read_fasta_file(file_path: str) -> list:
    """Lit un fichier FASTA et retourne une liste de tuples (nom, séquence)."""
    sequences = []
    current_name = ""
    current_sequence = []
    
    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('>'):
                if current_name and current_sequence:
                    # Remplace les espaces par des tirets et joint la séquence
                    full_sequence = ''.join(current_sequence).replace(' ', '-')
                    sequences.append((current_name, full_sequence))
                current_name = line[1:]  # Enlève le '>' et garde le reste
                current_sequence = []
            elif line:  # Si la ligne n'est pas vide
                current_sequence.append(line)
    
    # Ajoute la dernière séquence
    if current_name and current_sequence:
        # Remplace les espaces par des tirets et joint la séquence
        full_sequence = ''.join(current_sequence).replace(' ', '-')
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
    """Formate l'alignement de la séquence avec ses indices numériques."""
    result = []
    
    # En-tête avec le nom de la protéine
    result.append(f"\033[1;36m=== Conversion de la protéine : {name} ===\033[0m\n")
    
    for i in range(0, len(sequence), width):
        # Extrait les portions de séquence et indices pour cette ligne
        seq_line = sequence[i:i+width]
        num_line = numeric[i:i+width]
        
        # Ajoute les numéros de position
        pos_start = str(i + 1)
        pos_end = str(min(i + width, len(sequence)))
        result.append(f"\033[1;33mPosition: {pos_start.rjust(4)}-{pos_end.ljust(4)}\033[0m")
        
        # Crée l'en-tête du tableau
        result.append("┌" + "───┬" * (len(seq_line) - 1) + "───┐")
        
        # Ligne des séquences
        seq_line_formatted = "│"
        for aa in seq_line:
            seq_line_formatted += f" {aa} │"
        result.append(seq_line_formatted)
        
        # Ligne de séparation
        result.append("├" + "───┼" * (len(seq_line) - 1) + "───┤")
        
        # Ligne des indices
        num_line_formatted = "│"
        for num in num_line:
            if num == -1:
                num_line_formatted += "\033[1;37m - \033[0m│"  # Affiche -- en blanc pour les gaps
            else:
                color = "\033[1;3" + str((num % 6) + 1) + "m"
                num_line_formatted += f"{color}{num:2d} \033[0m│"  # Aligne le numéro sur 2 caractères
        result.append(num_line_formatted)
        
        # Ligne de fermeture du tableau
        result.append("└" + "───┴" * (len(seq_line) - 1) + "───┘")
        result.append("")  # Ligne vide pour la lisibilité
    
    return '\n'.join(result)

def main():
    if len(sys.argv) != 2:
        print("Usage: ./align_sequences.py <sequence_file>")
        sys.exit(1)
    
    sequence_file = sys.argv[1]
    
    try:
        # Lit les séquences au format FASTA
        sequences = read_fasta_file(sequence_file)
        
        # Pour chaque séquence dans le fichier
        for name, sequence in sequences:
            # Convertit en indices numériques
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
        print(f"Erreur lors de la conversion: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 