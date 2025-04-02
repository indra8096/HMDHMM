#!/usr/bin/env python3

import os
import subprocess
import sys
import tempfile
import re

def afficher_sequence_avec_indices(sequence, titre, largeur_ligne=60):
    AA = list("_ACDEFGHIKLMNPQRSTVWYX")
    sequence = 'X' * 40 + sequence
    sequence = sequence.replace(' ', 'X') #remplace les espaces par X
    for i in range(0, len(sequence), 40):
        bloc = sequence[i:i+40]
        
        print(f"Position: {i+1}-{i+len(bloc)}")
        print(titre[:11]," | ", end="")
        for aa in bloc:
            print(f" {aa} │", end="")
        print()
        print(titre[:11]," | ", end="")
        for aa in bloc:
            try:
                index = AA.index(aa)
                print(f"\033[1;3m{index:2d} \033[0m│", end="")
            except ValueError:
                print("\033[1;37m ? \033[0m│", end="")
        print()
        print() 

def sequence_to_obs_file(sequence, nom_fichier):
    
    AA = list("_ACDEFGHIKLMNPQRSTVWYX")
    sequence = 'X' * 40 + sequence
    sequence = sequence.replace(' ', 'X')
    observations = []
    for aa in sequence:
        try:
            index = AA.index(aa)
            observations.append(str(index))
        except ValueError:
            observations.append("?") 
    try:
        with open(nom_fichier, 'w') as f:
            f.write(f"T= {len(observations)}\n")
            f.write(" ".join(observations))
        print(f"Fichier d'observations généré : '{nom_fichier}'")
        return True
    except Exception as e:
        print(f"Erreur lors de l'écriture du fichier : {str(e)}")
        return False

def executer_testvit(modele, fichier_obs):
    try:
        if not os.path.isfile("./testvit"):
            print("Erreur : tu n'es pas dans le bon répertoire.")
            return None
        
        if not os.path.isfile(modele):
            print(f"Erreur : Le modèle '{modele}' existe pas.")
            return None
            
        if not os.path.isfile(fichier_obs):
            print(f"Erreur : Le fichier d'obs '{fichier_obs}' n'existe pas.")
            return None
        
        print(f"\nExécution de testvit avec le modèle '{modele}' et les obs '{fichier_obs}'...")
    
        resultat = subprocess.run(["./testvit", modele, fichier_obs], 
                                  capture_output=True, 
                                  text=True,
                                  check=True)
        
        print("\n=== Résultat de testvit ===")
        print(resultat.stdout)
        
        if resultat.stderr:
            print("Erreurs éventuelles :")
            print(resultat.stderr)
        
        return resultat.stdout
            
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors de l'exécution de testvit : {e}")
        if e.stderr:
            print(f"Message derreur : {e.stderr}")
        return None
    except Exception as e:
        print(f"Erreur inattendue : {str(e)}")
        return None

def afficher_alignement(sequence_originale, resultat_testvit):
    """
    Extrait et affiche l'alignement des séquences à partir du résultat de testvit
    """
    if not resultat_testvit:
        return
    
    # Extraire les séquences du résultat de testvit
    sequence_hmm = None
    sequence_viterbi = None
    
    # Chercher la séquence d'états la plus probable
    match_viterbi = re.search(r"Sequence d'etats la plus probable:[\r\n]+([^\r\n]+)", resultat_testvit)
    if match_viterbi:
        sequence_viterbi = match_viterbi.group(1).strip()
    
    # Si on a trouvé une séquence, l'afficher alignée avec la séquence originale
    if sequence_viterbi:
        print("\n=== Alignement des séquences ===")
        
        sequence_originale = 'X' * 40 + sequence_originale.replace(' ', 'X')
        
        # Assurer que les deux séquences ont la même longueur pour l'alignement
        min_len = min(len(sequence_originale), len(sequence_viterbi))
        
        for i in range(0, min_len, 60):
            bloc_orig = sequence_originale[i:i+60]
            bloc_viterbi = sequence_viterbi[i:i+60]
            
            print(f"\nPosition: {i+1}-{i+len(bloc_orig)}")
            print("Original   | " + ' '.join(bloc_orig))
            print("Viterbi    | " + ' '.join(bloc_viterbi))
            print("Match      | ", end="")
            for j in range(len(bloc_orig)):
                if j < len(bloc_viterbi) and bloc_orig[j] == bloc_viterbi[j]:
                    print("| ", end="")
                else:
                    print("  ", end="")
            print()
            print("-" * 80)

def afficher_aide():
    sys.exit(1)

if __name__ == "__main__":
    # Vérifier le nombre d'arguments
    if len(sys.argv) != 3 or "--help" in sys.argv or "-h" in sys.argv:
        afficher_aide()
    
    # Récupérer les arguments
    chemin_fichier = sys.argv[1]
    modele_hmm = sys.argv[2]
    
    try:
        # Lire le fichier FASTA
        with open(chemin_fichier, "r") as f:
            contenu = f.read().strip()
            lignes = contenu.split('\n')
            titre = None
            sequence = ""  
            for ligne in lignes:
                if ligne.startswith('>'):
                    titre = ligne[1:]
                else:
                    sequence += ligne.strip()
            
            if titre:
                print(f"=== {titre} ===\n")
            else:
                titre = "Sequence"
            
            # Afficher la séquence avec les indices
            afficher_sequence_avec_indices(sequence, titre)
            
            # Générer automatiquement un fichier d'observations temporaire
            fichier_obs = os.path.join(tempfile.gettempdir(), f"obs_{os.getpid()}.txt")
            
            if sequence_to_obs_file(sequence, fichier_obs):
                # Exécuter testvit et récupérer le résultat
                resultat = executer_testvit(modele_hmm, fichier_obs)
                
                # Afficher l'alignement des séquences
                if resultat:
                    afficher_alignement(sequence, resultat)
            
            print("\n=== Légende ===")
            legend = []
            for i, aa in enumerate(list("_ACDEFGHIKLMNPQRSTVWYX")):
                legend.append(f"{aa}={i}")
            print(" ".join(legend))
            
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{chemin_fichier}' n'a pas été trouvé.")
    except Exception as e:
        print(f"Erreur : {str(e)}")
        import traceback
        traceback.print_exc()


