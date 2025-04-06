import os 
import sys
import tempfile
import subprocess

"""
Nom du script : defcat.py
Description   : 
Auteur        : Guillaume Rosin
Date          : 06/04/2025
Version       : 1.0
"""

AA = "_ACDEFGHIKLMNPQRSTVWYX"

def read_fasta_seq(file):
    with open(file, "r") as seq:
        sequence = seq.read()
    return sequence

def store_numeric_sequence_in_temp_file(numeric_sequence, sequence_title):
    with tempfile.NamedTemporaryFile(mode='w', delete=False, prefix=f"{sequence_title}_") as temp_file:
        num_values = len(numeric_sequence)
        temp_file.write(f"T= {num_values}\n")# Ajouter T
        temp_file.write(" ".join(str(n) for n in numeric_sequence))
    return temp_file.name

def convertisseur(file):
    temp_files = []
    with open(file,"r") as file:
        is_first_line = True
        sequence_title = ""
        all_numeric_sequence = []

        for line in file:
            if line.startswith(">"):
                if sequence_title:
                    temp_file_path = store_numeric_sequence_in_temp_file(all_numeric_sequence, sequence_title)
                    print(f"\nContenu du fichier temporaire {temp_file_path} :")
                    temp_files.append(temp_file_path) 
                    with open(temp_file_path, "r") as temp_file:
                        print(temp_file.read())
                # Nouvelle séquence, réinitialiser les variables
                sequence_title = line[1:].strip()  # Enlever '>' et espaces
                all_numeric_sequence = []  
                is_first_line = True      

                title = line[1:].strip() #enleve > et les " "  
                is_first_line = True
            else:
                aa_seq = line.strip() 
                if is_first_line:
                    aa_seq = "X" * 40 + aa_seq
                    is_first_line = False
                numeric_sequence = [AA.index(aa) if aa in AA else '?' for aa in aa_seq]
                all_numeric_sequence.extend(numeric_sequence)

                aa_line = " ".join(f"{t:>2}" for t in aa_seq)
                aligned_numeric = " ".join(f"{n:>2}" for n in numeric_sequence)

                print(f"{title[:15]}   {aa_line}")
                print(f"{title[:15]}   {aligned_numeric}")
                print()
        if sequence_title:
            temp_file_path = store_numeric_sequence_in_temp_file(all_numeric_sequence, sequence_title)
            temp_files.append(temp_file_path)
            print(f"\nContenu du dernier fichier temporaire {temp_file_path} :")
            with open(temp_file_path, "r") as temp_file:
                print(temp_file.read())
    return temp_files

def run_testvit(modele_file, obs_file):
    with tempfile.NamedTemporaryFile(mode='w', delete=False, prefix="results_") as temp_file:
    
        command = ["./testvit", modele_file, obs_file]

        with open(temp_file.name, "w") as temp_out:
            result = subprocess.run(command, stdout=temp_out, stderr=subprocess.PIPE)
    
        with open(temp_file.name, "r") as f:
                preview = f.read(200)  
                print("Aperçu des résultats:\n")
                print(preview)
        return temp_file.name

def main():
    file = sys.argv[1]
    model = sys.argv[2]

    temp_files = convertisseur(file)

    #MySeq = read_fasta_seq(file)
    Conv = convertisseur(file)
    #print(MySeq)  #premier exo 
    print(Conv)   #second exo

    #exo 3
    for temp_file in temp_files:
        result_file = run_testvit(model, temp_file)
        print(result_file)

if __name__ == "__main__":
    main()
    
