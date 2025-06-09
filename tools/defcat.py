import os 
import sys
import tempfile
import subprocess

"""
Nom du script : defcat.py
Description   : python3 convertisseur.py <fichier_fasta> <modele_hmm>
Auteur        : Guillaume Rosin
Date          : 06/04/2025
Version       : 1.0

MISE A JOUR : 07/06/2025
Version       : 1.1
Description   : 
"""


AA = "_ACDEFGHIKLMNPQRSTVWYX"

def read_fasta_seq(file): #me permet de lire le fichier fasta
    with open(file, "r") as seq:
        sequence = seq.read()
    return sequence

def store_numeric_sequence_in_temp_file(numeric_sequence, sequence_title):
    with tempfile.NamedTemporaryFile(mode='w', delete=False, prefix=f"{sequence_title}_") as temp_file:
        num_values = len(numeric_sequence)
        temp_file.write(f"T= {num_values}\n")# Ajouter T= pour le nombre de valeurs
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
                        print()
                        print()
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
                print()
                print("Aperçu des résultats:\n")
                print(preview)
                print()
        return temp_file.name


def read_temp_file(temp_file_path):
    with open(temp_file_path, "r") as temp_file:
        return temp_file.read()
    

def needleman_wunsch(seq1, seq2, match=1, mismatch=-1, gap=-2):
    
    n, m = len(seq1), len(seq2)
    score = [[0] * (m + 1) for _ in range(n + 1)]

    # Initialisation des scores pour les gaps
    for i in range(n + 1):
        score[i][0] = gap * i
    for j in range(m + 1):
        score[0][j] = gap * j

    # Remplissage de la matrice de scores
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            diag = score[i - 1][j - 1] + (match if seq1[i - 1] == seq2[j - 1] else mismatch)
            up = score[i - 1][j] + gap
            left = score[i][j - 1] + gap
            score[i][j] = max(diag, up, left)

    # Reconstruction de l'alignement (traceback)
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

    # Ajout des gaps restants
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
    # separation super pratique !
    print("\n" + "="*60)
    print("          ALIGNEMENT DES SÉQUENCES")
    print("="*60)
    
    sequences = []
    sequence_names = []
    current_seq = ""
    name_seq = ""

    # Lecture du fichier protéique
    with open(file, "r") as f:
        for line in f:
            line = line.strip() 
            if line.startswith(">"):
                if current_seq:
                    sequences.append(current_seq)
                    sequence_names.append(name_seq)
                name_seq = line[1:]  # Enlever le '>'
                current_seq = ""
            else:
                current_seq += line
        
        # Ajouter la dernière séquence
        if current_seq:
            sequences.append(current_seq)
            sequence_names.append(name_seq)

    print(f"Nombre de séquences : {len(sequences)}")
    
    if len(sequences) < 2:
        print("Erreur : Il faut au moins 2 séquences pour effectuer un alignement.")
        return
    
    # J'affiche mes séquences trouvées
    print("\nSéquences détectées :")
    for i, (name, seq) in enumerate(zip(sequence_names, sequences)):
        print(f"  {i+1}. {name} (longueur: {len(seq)})")
        print(f"     Début: {seq[:50]}{'...' if len(seq) > 50 else ''}")
    
    # J'aligne chaque seq a chaque autre seq
    total_alignments = 0
    for i in range(len(sequences)):
        for j in range(i + 1, len(sequences)):
            total_alignments += 1
            
            print(f"\n" + "="*80)
            print(f"ALIGNEMENT {total_alignments} : '{sequence_names[i]}' vs '{sequence_names[j]}'")
            print("="*80)
            
            seq1 = sequences[i]
            seq2 = sequences[j]
            
            #8 premières lettres pour le nom de chaque protéine
            name1_short = sequence_names[i][:8]
            name2_short = sequence_names[j][:8]
            
            print(f"Séquence {i+1}: {sequence_names[i]} (longueur: {len(seq1)})")
            print(f"Séquence {j+1}: {sequence_names[j]} (longueur: {len(seq2)})")
            
            align1, align2, score = needleman_wunsch(seq1, seq2)
            
            # Affichage de l'alignement par blocs de 80 caractères
            block_size = 80
            print(f"\nAffichage de l'alignement :")
            print("-" * 80)
            
            for k in range(0, len(align1), block_size):
                block1 = align1[k:k+block_size]
                block2 = align2[k:k+block_size]
                
                # Création de la ligne de correspondance
                match_line = ""
                for c1, c2 in zip(block1, block2):
                    if c1 == c2:
                        match_line += "|"
                    elif c1 == "-" or c2 == "-":
                        match_line += " "
                    else:
                        match_line += "."
                
                print(f"\nPosition {k+1}-{min(k+block_size, len(align1))}:")
                print(f"{name1_short}: {block1}")
                print(f"{'':>8}  {match_line}")
                print(f"{name2_short}: {block2}")
            
            # Statistiques de l'alignement
            matches = sum(1 for c1, c2 in zip(align1, align2) if c1 == c2 and c1 != "-")
            gaps = align1.count("-") + align2.count("-")
            mismatches = len(align1) - matches - gaps
            identity = (matches / len(align1)) * 100
            
            # j'ai trouvé ca sur un github je me suis dis que c'etait pas mal
            print(f"\n" + "-"*60)
            print("STATISTIQUES DE CET ALIGNEMENT :")
            print(f"  Score d'alignement : {score}")
            print(f"  Longueur de l'alignement : {len(align1)}")
            print(f"  Correspondances exactes : {matches}")
            print(f"  Mésappariements : {mismatches}")
            print(f"  Gaps : {gaps}")
            print(f"  Identité : {identity:.2f}%")
            print("-"*60)
    
    print(f"\n" + "="*80)
    print(f"RÉSUMÉ : {total_alignments} alignements réalisés entre {len(sequences)} séquences")
    print("="*80)
    
    return align1, align2, score


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
    # Exo 4 - Alignement des séquences
    alignement_des_sequences(file)

if __name__ == "__main__":
    main()
    
