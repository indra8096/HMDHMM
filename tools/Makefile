CC = gcc
CFLAGS = -Wall -Wextra -O2

all: generate_markov_sequence markov_long_sim

generate_markov_sequence: generate_markov_sequence.c
	$(CC) $(CFLAGS) -o generate_markov_sequence generate_markov_sequence.c

markov_long_sim: markov_long_sim.c
	$(CC) $(CFLAGS) -o markov_long_sim markov_long_sim.c -lm

clean:
	rm -f generate_markov_sequence markov_long_sim 