def fasta_to_numeric():
    encoding = { 1: 'A', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'K',
        10: 'L', 11: 'M', 12: 'N', 13: 'P', 14: 'Q', 15: 'R', 16: 'S', 17: 'T', 
        18: 'V', 19: 'W', 20: 'Y', 21: 'X' 
    }
    input_file = input("File FASTA en entrée : ")
    output_file = input("File numérique en sortie : ")
    
    try:
        with open(input_file, "r") as in_file, open(output_file, "w") as out_file:
            current_id = None
            for line in in_file:
                if line.startswith(">"):  
                    if current_id:  
                        out_file.write(f"{' '.join(map(str, current_sequence))}\n")
                    current_id = line.strip()[1:]  # je retire le ">"
                    current_sequence = []
                else:
                    sequence = line.strip()
                    current_sequence.extend([encoding.get(aa, 0) for aa in sequence])  

            
            if current_id:
                out_file.write(f"{' '.join(map(str, current_sequence))}\n")

        print(f"Conversion terminée. Résultat enregistré dans '{output_file}'.")

    except FileNotFoundError:
        print(f"Erreur : Le fichier '{input_file}' est introuvable.")
    except ValueError:
        print("Erreur : Format de fichier invalide. Vérifiez que les séquences FASTA sont bien formatées.")

def numeric_to_fasta():
    decoding = { 1: 'A', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'K',
        10: 'L', 11: 'M', 12: 'N', 13: 'P', 14: 'Q', 15: 'R', 16: 'S', 17: 'T', 
        18: 'V', 19: 'W', 20: 'Y', 21: 'X' 
    }

    input_file = input("File numérique en entrée : ")
    output_fasta = input("File FASTA en sortie : ")

    try:
        with open(input_file, "r") as in_file, open(output_fasta, "w") as out_file:
            current_id = None
            sequence = []

            for line in in_file:
                line = line.strip()
                if not line:
                    continue

                numbers = map(int, line.split()) 
                sequence.extend([decoding.get(num, 'X') for num in numbers])

            out_file.write(f">{current_id or 'Sequence'}\n{''.join(sequence)}\n")

        print(f"Conversion finie.'{output_fasta}'.")

    except FileNotFoundError:
        print(f"Erreur : Le fichier '{input_file}' n'est pas trouvé.")
    except ValueError:
        print("Erreur : Format de fichier invalide. Vérifiez que les valeurs sont bien des entiers.")

def main():
    choice = input("(1 : FASTA --> Numérique, 2 : Numérique --> FASTA) : ")

    if choice == "1":
        fasta_to_numeric()
    elif choice == "2":
        numeric_to_fasta()
    else:
        print("Choix invalide. Veuillez entrer 1 ou 2.")
main()
