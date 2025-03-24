import React, { useState } from 'react';
import Head from 'next/head';
import { Navbar } from '../src/components/shared/Navbar';

export default function DnaConversion() {
  const [sequence, setSequence] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!sequence.trim()) {
      setError('Veuillez entrer une séquence ADN');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/dna/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequence,
          name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.output);
      } else {
        setError(data.error || 'Erreur lors de la conversion');
      }
    } catch (err) {
      setError('Erreur lors de la communication avec le serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Conversion ADN - UMDHMM</title>
        <meta name="description" content="Outil de conversion pour séquences ADN" />
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
        <h1 className="mb-4">Conversion ADN</h1>
        
        <div className="card">
          <div className="card-body">
            <p className="text-muted mb-4">
              Convertissez vos séquences ADN au format adapté pour les analyses UMDHMM.
              Entrez une séquence contenant les nucléotides A, C, G et T.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="sequenceInput" className="form-label">Séquence ADN</label>
                <textarea 
                  id="sequenceInput"
                  className="form-control" 
                  rows={10}
                  placeholder="Entrez votre séquence ADN ici (A, C, G, T)..."
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                ></textarea>
                <div className="form-text">
                  Seuls les caractères A, C, G et T seront pris en compte.
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="sequenceName" className="form-label">Nom de la séquence (optionnel)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="sequenceName" 
                  placeholder="ex: Homo sapiens"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    Conversion en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-dna me-2"></i>
                    Convertir
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-4">
              <h4>Résultat</h4>
              
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
              
              {result ? (
                <div className="bg-dark text-light p-3 rounded" style={{ fontFamily: 'monospace', whiteSpace: 'pre', overflowX: 'auto' }}>
                  {result}
                </div>
              ) : (
                <pre className="bg-light p-3 rounded">
                  {!error && !loading && "(Le résultat de la conversion apparaîtra ici)"}
                </pre>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 