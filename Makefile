#
#
# Make file for compiling HMM code in this directory.
# Author: Tapas Kanungo
# Date: 23 February 1998
# $Id: Makefile,v 1.3 1998/02/23 08:12:35 kanungo Exp kanungo $
# 
#
CFLAGS= -g
INCS=
# use the following line to "Purify" the code
#CC=purify gcc
CC=gcc
SRCS=baum.c viterbi.c forward.c backward.c hmmutils.c sequence.c \
	genseq.c nrutil.c testvit.c esthmm.c hmmrand.c testfor.c 

PROGS = esthmm testfor testvit genseq converter

all: $(PROGS)

esthmm: esthmm.o forward.o backward.o baum.o nrutil.o hmmutils.o sequence.o hmmrand.o
	$(CC) $(CFLAGS) -o $@ $^ -lm

testfor: testfor.o forward.o nrutil.o hmmutils.o sequence.o
	$(CC) $(CFLAGS) -o $@ $^ -lm

testvit: testvit.o viterbi.o nrutil.o hmmutils.o sequence.o
	$(CC) $(CFLAGS) -o $@ $^ -lm

genseq: genseq.o hmmutils.o sequence.o hmmrand.o nrutil.o
	$(CC) $(CFLAGS) -o $@ $^ -lm

converter: src/converters/converter.c
	$(CC) $(CFLAGS) -o $@ $^ -lm

clean:
	rm -f *.o $(PROGS)
# DO NOT DELETE THIS LINE -- make depend depends on it.

