import React from 'react';
import { Navbar } from '../components/shared/Navbar';

export const DNAConversion: React.FC = () => {
    return (
        <>
            <Navbar />
            <main className="pt-5">
                <div className="container mt-5">
                    <h1 className="display-4 mb-4">Conversion ADN avec États</h1>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h2 className="h5 mb-0">Numérique vers FASTA</h2>
                                </div>
                                <div className="card-body">
                                    <form id="numToFastaForm">
                                        <div className="mb-3">
                                            <label htmlFor="numericFile" className="form-label">Fichier numérique</label>
                                            <input type="file" className="form-control" id="numericFile" required accept=".seq,.txt" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="seqName" className="form-label">Nom de la séquence</label>
                                            <input type="text" className="form-control" id="seqName" defaultValue="seq" />
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            <i className="fas fa-dna me-2"></i>
                                            Convertir
                                        </button>
                                    </form>
                                    <div id="numToFastaResult" className="mt-3 result-box"></div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <h2 className="h5 mb-0">FASTA vers Numérique</h2>
                                </div>
                                <div className="card-body">
                                    <form id="fastaToNumForm">
                                        <div className="mb-3">
                                            <label htmlFor="fastaFile" className="form-label">Fichier FASTA</label>
                                            <input type="file" className="form-control" id="fastaFile" required accept=".fasta,.fa" />
                                        </div>
                                        <button type="submit" className="btn btn-primary">
                                            <i className="fas fa-calculator me-2"></i>
                                            Convertir
                                        </button>
                                    </form>
                                    <div id="fastaToNumResult" className="mt-3 result-box"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section d'explication */}
                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="h5 mb-0">À propos de la conversion ADN</h2>
                                </div>
                                <div className="card-body">
                                    <h3 className="h6">Format Numérique</h3>
                                    <p>Le format numérique représente les bases d'ADN par des nombres :</p>
                                    <ul>
                                        <li>A (Adénine) → 0</li>
                                        <li>C (Cytosine) → 1</li>
                                        <li>G (Guanine) → 2</li>
                                        <li>T (Thymine) → 3</li>
                                    </ul>

                                    <h3 className="h6 mt-4">Format FASTA</h3>
                                    <p>Le format FASTA est un format texte pour représenter des séquences :</p>
                                    <pre className="bg-light p-3 rounded">
                                        {`>Nom_sequence
ATCGATCG...`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}; 