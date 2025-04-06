import os 
import sys

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

def convertisseur(file):
    with open(file,"r") as file:
        is_first_line = True
        for line in file:
            if line.startswith(">"):
                title = line[1:].strip() #enleve > et les " "  
                is_first_line = True
            else:
                aa_seq = line.strip() 
                if is_first_line:
                    aa_seq = "X" * 40 + aa_seq
                    is_first_line = False
                numeric_sequence = [AA.index(aa) if aa in AA else '?' for aa in aa_seq]
                
                aa_line = " ".join(f"{t:>2}" for t in aa_seq)
                aligned_numeric = " ".join(f"{n:>2}" for n in numeric_sequence)

                print(f"{title[:15]}   {aa_line}")
                print(f"{title[:15]}   {aligned_numeric}")
                print()             
    return 

def main():
    file = sys.argv[1]
    #MySeq = read_fasta_seq(file)
    Conv = convertisseur(file)
    #print(MySeq)  #premier exo 
    print(Conv)   #second exo




if __name__ == "__main__":
    main()
    
