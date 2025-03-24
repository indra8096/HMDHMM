import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Navbar } from '../src/components/shared/Navbar';

export default function Home() {
  return (
    <div>
      <Head>
        <title>UMDHMM - Interface pour Hidden Markov Models</title>
        <meta name="description" content="Interface web pour UMDHMM utilisant Next.js" />
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
      
      <main className="container py-5">
        <div className="jumbotron text-center mb-5">
          <h1 className="display-4">UMDHMM</h1>
          <p className="lead">
            Interface web pour l'utilisation des modèles de Markov cachés (HMM)
          </p>
          <hr className="my-4" />
          <p>
            Utilisez nos outils pour analyser vos séquences biologiques, reconnaître des motifs et plus encore.
          </p>
        </div>
        
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-tools fa-3x mb-3 text-primary"></i>
                <h3 className="card-title h5">Outils HMM</h3>
                <p className="card-text">
                  Accédez à tous nos outils pour travailler avec les modèles de Markov cachés.
                </p>
                <Link href="/hmm-tools" className="btn btn-primary">
                  Accéder aux outils
                </Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-dna fa-3x mb-3 text-success"></i>
                <h3 className="card-title h5">Conversion ADN</h3>
                <p className="card-text">
                  Convertissez vos séquences ADN au format adapté pour UMDHMM.
                </p>
                <Link href="/dna-conversion" className="btn btn-success">
                  Convertir des séquences
                </Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="fas fa-book fa-3x mb-3 text-info"></i>
                <h3 className="card-title h5">Documentation</h3>
                <p className="card-text">
                  Consultez la documentation complète des outils UMDHMM.
                </p>
                <Link href="/documentation" className="btn btn-info">
                  Voir la documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 