#!/usr/bin/env python3

import os
import subprocess
import sys

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
        print(f"Fichier '{nom_fichier}' généré avec succès !")
        return True
    except Exception as e:
        print(f"Erreur lors de l'écriture du fichier : {str(e)}")
        return False

def executer_testvit(modele, fichier_obs):
    try:
        if not os.path.isfile("./testvit"):
            print("Erreur : tu n'es pas dans le bon répertoire.")
            return
        
        if not os.path.isfile(modele):
            print(f"Erreur : Le modèle '{modele}' existe pas.")
            return
            
        if not os.path.isfile(fichier_obs):
            print(f"Erreur : Le fichier d'obs '{fichier_obs}' n'existe pas.")
            return
        
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
            
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors de l'exécution de testvit : {e}")
        if e.stderr:
            print(f"Message derreur : {e.stderr}")
    except Exception as e:
        print(f"Erreur inattendue : {str(e)}")

def lister_modeles_hmm(repertoire="."):
    extensions_possibles = [".hmm", ".mod", ".model", ".txt"]
    modeles = []
    
    try:
        for fichier in os.listdir(repertoire):
            if os.path.isfile(os.path.join(repertoire, fichier)):
                if any(fichier.endswith(ext) for ext in extensions_possibles) or "." not in fichier:
                    modeles.append(fichier)
        return modeles
    except Exception as e:
        print(f"Erreur lors de la recherche de modèles : {str(e)}")
        return []

def afficher_aide():
    print("Usage: python convertisseur.py <fichier_fasta> [options]")
    print("\nOptions:")
    print("  --obs <fichier>     Génère un fichier d'observations")
    print("  --testvit <modele>  Exécute testvit avec le modèle et les observations")
    print("\nExemple:")
    print("  python convertisseur.py sequence.fasta --obs observations.txt --testvit modele.hmm")
    sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        afficher_aide()
    
    # Récupérer le chemin du fichier FASTA (premier argument)
    chemin_fichier = sys.argv[1]
    
    # Options par défaut
    fichier_obs = None
    modele_hmm = None
    
    # Analyser les autres arguments
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == "--obs" and i + 1 < len(sys.argv):
            fichier_obs = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--testvit" and i + 1 < len(sys.argv):
            modele_hmm = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--help" or sys.argv[i] == "-h":
            afficher_aide()
        else:
            print(f"Option inconnue: {sys.argv[i]}")
            afficher_aide()
    
    try:
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
            afficher_sequence_avec_indices(sequence, titre)
            if fichier_obs:
                if sequence_to_obs_file(sequence, fichier_obs):
                    if modele_hmm:
                        executer_testvit(modele_hmm, fichier_obs)
            
            print("\n=== Légende ===")
            legend = []
            for i, aa in enumerate(list("_ACDEFGHIKLMNPQRSTVWYX")):
                legend.append(f"{aa}={i}")
            print(" ".join(legend))
            
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{chemin_fichier}' n'a pas été trouvé.")
    except Exception as e:
        print(f"Erreur : {str(e)}")
        raise


