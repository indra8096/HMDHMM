import os 
import sys
import tempfile
import subprocess

"""
Nom du script : defcat.py
Description   : python3 defcat.py <fichier_fasta> <modele_hmm>
Auteur        : Guillaume Rosin
Date          : 06/04/2025
Version       : 1.0

MISE A JOUR : 07/06/2025
Version       : 1.1
Description   : Intégration alignement Needleman-Wunsch
"""

AA = "_ACDEFGHIKLMNPQRSTVWYX"

def read_fasta_seq(file):
    with open(file, "r") as seq:
        sequence = seq.read()
    return sequence

def store_numeric_sequence_in_temp_file(numeric_sequence, sequence_title):
    with tempfile.NamedTemporaryFile(mode='w', delete=False, prefix=f"{sequence_title}_") as temp_file:
        num_values = len(numeric_sequence)
        temp_file.write(f"T= {num_values}\n")
        temp_file.write(" ".join(str(n) for n in numeric_sequence))
    return temp_file.name

def convertisseur(file):
    temp_files = []
    with open(file, "r") as file:
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
                        print()
                        print()
                sequence_title = line[1:].strip()
                all_numeric_sequence = []  
                is_first_line = True      
                title = sequence_title
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
                print()
                
        if sequence_title:
            temp_file_path = store_numeric_sequence_in_temp_file(all_numeric_sequence, sequence_title)
            temp_files.append(temp_file_path)
            print(f"\nContenu du dernier fichier temporaire {temp_file_path} :")
            with open(temp_file_path, "r") as temp_file:
                print(temp_file.read())
                print()
    return temp_files

def run_testvit(modele_file, obs_file):
    with tempfile.NamedTemporaryFile(mode='w', delete=False, prefix="results_") as temp_file:
        command = ["./testvit", modele_file, obs_file]
        with open(temp_file.name, "w") as temp_out:
            result = subprocess.run(command, stdout=temp_out, stderr=subprocess.PIPE)
        with open(temp_file.name, "r") as f:
            preview = f.read(200)
            print("\nAperçu des résultats:\n")
            print(preview)
            print()
        return temp_file.name

def needleman_wunsch(seq1, seq2, match=1, mismatch=-1, gap=-2):
    n, m = len(seq1), len(seq2)
    score = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        score[i][0] = gap * i
    for j in range(m + 1):
        score[0][j] = gap * j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            diag = score[i - 1][j - 1] + (match if seq1[i - 1] == seq2[j - 1] else mismatch)
            up = score[i - 1][j] + gap
            left = score[i][j - 1] + gap
            score[i][j] = max(diag, up, left)

    align1, align2 = "", ""
    i, j = n, m
    while i > 0 and j > 0:
        current = score[i][j]
        diag = score[i - 1][j - 1]
        up = score[i - 1][j]
        left = score[i][j - 1]

        if current == diag + (match if seq1[i - 1] == seq2[j - 1] else mismatch):
            align1 = seq1[i - 1] + align1
            align2 = seq2[j - 1] + align2
            i -= 1
            j -= 1
        elif current == up + gap:
            align1 = seq1[i - 1] + align1
            align2 = "-" + align2
            i -= 1
        else:
            align1 = "-" + align1
            align2 = seq2[j - 1] + align2
            j -= 1

    while i > 0:
        align1 = seq1[i - 1] + align1
        align2 = "-" + align2
        i -= 1
    while j > 0:
        align1 = "-" + align1
        align2 = seq2[j - 1] + align2
        j -= 1

    return align1, align2, score[n][m]

def alignement_des_sequences(file):
    print("\nAlignement des séquences :\n")
    sequences = []
    current_seq = ""

    with open(file, "r") as f:
        for line in f:
            if line.startswith(">"):
                if current_seq:
                    sequences.append(current_seq)
                    current_seq = ""
            else:
                current_seq += line.strip()
        if current_seq:
            sequences.append(current_seq)

    if len(sequences) >= 2:
        seq1 = sequences[0]
        seq2 = sequences[1]
        align1, align2, score = needleman_wunsch(seq1, seq2)
        print("Séquence 1 alignée :", align1)
        print("Séquence 2 alignée :", align2)
        print("Score d’alignement :", score)
    else:
        print("Pas assez de séquences pour un alignement.")

def main():
    file = sys.argv[1]
    model = sys.argv[2]

    temp_files = convertisseur(file)

    # Affichage de l'alignement (Exo 3)
    alignement_des_sequences(file)

    for temp_file in temp_files:
        result_file = run_testvit(model, temp_file)
        print(f"Résultat écrit dans : {result_file}")

if __name__ == "__main__":
    main()
