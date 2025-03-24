import React from 'react';
import Head from 'next/head';
import { Navbar } from '../src/components/shared/Navbar';

export default function Documentation() {
  const scripts = [
    {
      name: 'testfor',
      description: 'Calcule la probabilité P(O|λ) qu\'une séquence d\'observations O soit générée par un modèle λ.',
      usage: './testfor [-v] hmm_file seq_file',
      options: [
        { flag: '-v', description: 'Mode verbose' }
      ],
      example: './testfor -v model.hmm sequence.seq',
      outputFormat: 'Probabilité logarithmique de la séquence'
    },
    {
      name: 'testvit',
      description: 'Trouve la séquence d\'états la plus probable pour une séquence d\'observations donnée.',
      usage: './testvit [-v] hmm_file seq_file',
      options: [
        { flag: '-v', description: 'Mode verbose' }
      ],
      example: './testvit -v model.hmm sequence.seq',
      outputFormat: 'Séquence d\'états la plus probable'
    },
    {
      name: 'testbw',
      description: 'Ré-estime les paramètres d\'un modèle HMM à partir d\'une séquence d\'observations.',
      usage: './testbw [-i iterations] [-t threshold] [-v] hmm_file seq_file',
      options: [
        { flag: '-i iterations', description: 'Nombre d\'itérations (défaut: 100)' },
        { flag: '-t threshold', description: 'Seuil de convergence (défaut: 0.001)' },
        { flag: '-v', description: 'Mode verbose' }
      ],
      example: './testbw -i 200 -t 0.0001 -v model.hmm sequence.seq',
      outputFormat: 'Modèle HMM ré-estimé'
    }
  ];

  return (
    <div>
      <Head>
        <title>Documentation - UMDHMM</title>
        <meta name="description" content="Documentation des outils UMDHMM" />
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
        <h1 className="mb-4">Documentation UMDHMM</h1>
        
        <div className="mb-5">
          <h2>Introduction</h2>
          <p>
            UMDHMM est une collection d'outils pour travailler avec les modèles de Markov cachés (HMM).
            Cette page fournit la documentation pour chaque outil disponible.
          </p>
        </div>

        {scripts.map((script) => (
          <div className="card mb-4" key={script.name}>
            <div className="card-header bg-dark text-white">
              <h3 className="h5 mb-0">
                <i className="fas fa-terminal me-2"></i>
                {script.name}
              </h3>
            </div>
            <div className="card-body">
              <h4 className="h6">Description</h4>
              <p>{script.description}</p>
              
              <h4 className="h6">Usage</h4>
              <pre className="bg-light p-2">{script.usage}</pre>
              
              <h4 className="h6">Options</h4>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {script.options.map((option, index) => (
                    <tr key={index}>
                      <td><code>{option.flag}</code></td>
                      <td>{option.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <h4 className="h6">Exemple</h4>
              <pre className="bg-light p-2">{script.example}</pre>
              
              <h4 className="h6">Format de sortie</h4>
              <p>{script.outputFormat}</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
} 