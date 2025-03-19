#!/usr/bin/env python3

def numeric_to_fasta(numeric_content, sequence_name="seq"):
    """Convertit une séquence numérique en format FASTA."""
    numbers = numeric_content.strip().split()
    # Mapping des nombres en lettres (0->A, 1->B, etc.)
    mapping = {str(i): chr(65 + i) for i in range(26)}
    
    sequence = ''.join(mapping[num] for num in numbers if num in mapping)
    return f">{sequence_name}\n{sequence}\n"

def fasta_to_numeric(fasta_content):
    """Convertit une séquence FASTA en format numérique."""
    lines = fasta_content.strip().split('\n')
    sequence = ''
    for line in lines:
        if not line.startswith('>'):
            sequence += line.strip()
    
    # Mapping des lettres en nombres (A->0, B->1, etc.)
    mapping = {chr(65 + i): str(i) for i in range(26)}
    numbers = [mapping[char] for char in sequence.upper() if char in mapping]
    
    return ' '.join(numbers)

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 4:
        print("Usage: converter.py [to-fasta|to-numeric] input_file output_file")
        sys.exit(1)
        
    mode = sys.argv[1]
    input_file = sys.argv[2]
    output_file = sys.argv[3]
    
    with open(input_file, 'r') as f:
        content = f.read()
    
    if mode == 'to-fasta':
        result = numeric_to_fasta(content)
    elif mode == 'to-numeric':
        result = fasta_to_numeric(content)
    else:
        print("Mode invalide. Utilisez 'to-fasta' ou 'to-numeric'")
        sys.exit(1)
        
    with open(output_file, 'w') as f:
        f.write(result) 