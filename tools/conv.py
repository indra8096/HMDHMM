def afficher_sequences_cote_a_cote(seq1, seq2, nom1="Séquence 1", nom2="Séquence 2", largeur=20):
    
    # Nettoyer les séquences
    seq1 = ' '.join(seq1.split())
    seq2 = ' '.join(seq2.split())
    
    # Afficher les en-têtes
    print(f"\n--- Tableau comparatif ---")
    
    # Parcourir les séquences par blocs
    for i in range(0, max(len(seq1), len(seq2)), largeur):
        # Extraire les blocs
        bloc1 = seq1[i:i+largeur] if i < len(seq1) else ""
        bloc2 = seq2[i:i+largeur] if i < len(seq2) else ""
        
        # Afficher le tableau simple
        print(f"Positions {i+1}-{min(i+largeur, max(len(seq1), len(seq2)))}")
        print(f"{nom1}: {bloc1}")
        print(f"{nom2}: {bloc2}")
        print("-" * 50)
    
# Exemple d'utilisation
seq1 = "query uga35"
seq2 = "MPEF SIPL"
afficher_sequences_cote_a_cote(seq1, seq2)