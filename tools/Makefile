CC = gcc
CFLAGS = -Wall -Wextra -O2

all: generate_markov_sequence

generate_markov_sequence: generate_markov_sequence.c
	$(CC) $(CFLAGS) -o generate_markov_sequence generate_markov_sequence.c

clean:
	rm -f generate_markov_sequence 