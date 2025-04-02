def fasta_to_numeric():
  AA = list("ACDEFGHIKLMNPQRSTVWYX")
  
  # test
  sequence_file = input("fichier sequence : ")
  with open(sequence_file, 'r') as f:
    for line in f:
      line = line.strip()
      if line.startswith('>'):
        name = line[1:]
        sequence = []
      else:
        sequence.append(line)
    sequence = ''.join(sequence)
    print(sequence)
        
  seq = "AADDFFHHKK"
  for s in seq: print(AA.index(s),end=' ')

def numeric_to_fasta():
  AA = list("ACDEFGHIKLMNPQRSTVWYX")
  seq = [1, 2, 3, 4, 5, 6, 7, 8]
  for s in seq: print(AA[s],end='')
  
def main():
  choice = input("tu veux quoiiii ? 1 ou 2 sachant que 1 Fasta --> Num et 2 Num --> Fasta")  
  if choice == "1":
    fasta_to_numeric()
  elif choice == "2":
    numeric_to_fasta()
main()  