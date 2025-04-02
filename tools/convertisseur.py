#!/usr/bin/env python3

import os
import subprocess

def afficher_sequence_avec_indices(sequence, largeur_ligne=60):
    AA = list("ACDEFGHIKLMNPQRSTUVWYX")
    sequence = 'X' * 40 + sequence
    sequence = sequence.replace(' ', 'X') #remplace les espaces par X
    for i in range(0, len(sequence), 20):
        bloc = sequence[i:i+20]
        print(f"Position: {i+1}-{i+len(bloc)}")
        print("seq","  ", end="")
        for aa in bloc:
            print(f" {aa} │", end="")
        print()
        print("obs","  ", end="")
        for aa in bloc:
            try:
                index = AA.index(aa)
                print(f"\033[1;3m{index:2d} \033[0m│", end="")
            except ValueError:
                print("\033[1;37m ? \033[0m│", end="")
        print()
        print() 

def sequence_to_obs_file(sequence, nom_fichier):
    
    AA = list("ACDEFGHIKLMNPQRSTUVWYX")
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

if __name__ == "__main__":
    chemin_fichier = input("Donne la seq fasta : ")
    
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
            
            afficher_sequence_avec_indices(sequence)
            
            generer_fichier = input("Générer un fichier d'obs ? (o/n) : ").lower()
            
            fichier_obs = None
            if generer_fichier == 'o' or generer_fichier == 'oui':
                nom_fichier = input("Nom du fichier de sortie pour les obs : ")
                if sequence_to_obs_file(sequence, nom_fichier):
                    fichier_obs = nom_fichier
            
            if fichier_obs:
                executer_testvit_option = input("Souhaites tu exécuter testvit avec ces observations ? (o/n) : ").lower()
                if executer_testvit_option == 'o' or executer_testvit_option == 'oui':
                    print("\nModèles HMM disponibles :")
                    modeles = lister_modeles_hmm()
                    
                    if modeles:
                        print("Modèles trouvés :")
                        for i, modele in enumerate(modeles, 1):
                            print(f"{i}. {modele}")
                        
                        choix = input("\nEntre le numéro du modèle à utiliser ou le chemin d'un autre modèle : ")
                        
                        try:
                            index = int(choix) - 1
                            if 0 <= index < len(modeles):
                                modele_choisi = modeles[index]
                            else:
                                print("Numéro invalide, spécifier un chemin manuellement.")
                                modele_choisi = input("Chemin du modèle HMM : ")
                        except ValueError:
                            modele_choisi = choix

                        executer_testvit(modele_choisi, fichier_obs)
                    else:
                        print("Aucun modèle trouvé.")
                        modele_choisi = input("Chemin vers un modèle HMM : ")
                        executer_testvit(modele_choisi, fichier_obs)
            
            print("\n=== Légende ===")
            legend = []
            for i, aa in enumerate(list("ACDEFGHIKLMNPQRSTUVWYX")):
                legend.append(f"{aa}={i}")
            print(" ".join(legend))
            
    except FileNotFoundError:
        print(f"Erreur : Le file'{chemin_fichier}' n'a pas été trouvé.")
    except Exception as e:
        print(f"Erreur : {str(e)}")


