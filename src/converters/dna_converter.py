#!/usr/bin/env python3

def format_sequence_with_states(sequence_name, sequence, block_size=60):
    """
    Formate une séquence ADN avec ses états numériques en blocs alignés.
    
    Args:
        sequence_name (str): Nom de la séquence/protéine
        sequence (str): Séquence ADN
        block_size (int): Taille des blocs (par défaut 60)
    
    Returns:
        str: Séquence formatée avec les états
    """
    # Conversion des nucléotides en états numériques
    nucleotide_to_state = {'A': '0', 'T': '1', 'G': '2', 'C': '3', 'N': '4'}
    states = [nucleotide_to_state.get(nuc.upper(), '4') for nuc in sequence]
    
    # Formatage de la sortie
    output = []
    for i in range(0, len(sequence), block_size):
        block_seq = sequence[i:i+block_size]
        block_states = ' '.join(states[i:i+block_size])
        
        # Ajouter le nom de la séquence seulement pour le premier bloc
        if i == 0:
            output.append(f">{sequence_name}")
        
        output.append(f"Sequence: {block_seq}")
        output.append(f"State:    {block_states}")
        output.append("")  # Ligne vide entre les blocs
    
    return '\n'.join(output)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 4:
        print("Usage: dna_converter.py input_file output_file sequence_name")
        sys.exit(1)
        
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    sequence_name = sys.argv[3]
    
    try:
        with open(input_file, 'r') as f:
            content = f.read().strip()
            
        # Extraire la séquence si au format FASTA
        if content.startswith('>'):
            sequence = ''.join(line.strip() for line in content.split('\n')[1:])
        else:
            sequence = content.replace('\n', '')
            
        formatted_output = format_sequence_with_states(sequence_name, sequence)
        
        with open(output_file, 'w') as f:
            f.write(formatted_output)
            
    except Exception as e:
        print(f"Erreur: {str(e)}")
        sys.exit(1) 