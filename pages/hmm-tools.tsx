import React from 'react';
import Head from 'next/head';
import { HMMTools } from '../src/components/shared/HMMTools';
import { Navbar } from '../src/components/shared/Navbar';

export default function HmmToolsPage() {
  return (
    <div>
      <Head>
        <title>Outils HMM - UMDHMM</title>
        <meta name="description" content="Outils pour les modèles de Markov cachés" />
        <link rel="icon" href="/favicon.ico" />
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" 
          rel="stylesheet"
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
        />
      </Head>

      <Navbar />
      <div className="container py-4">
        <HMMTools />
      </div>
    </div>
  );
} 