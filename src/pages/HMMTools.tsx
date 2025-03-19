import React, { useState } from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/shared/Card';

interface ToolResult {
    output: string;
    error?: string;
}

export const HMMTools: React.FC = () => {
    const [results, setResults] = useState<Record<string, ToolResult>>({});
    const [selectedFiles, setSelectedFiles] = useState<Record<string, { model: File | null; sequence: File | null }>>({
        testfor: { model: null, sequence: null },
        testvit: { model: null, sequence: null },
        testbw: { model: null, sequence: null },
        esthmm: { model: null, sequence: null }
    });

    const handleFileChange = (tool: string, type: 'model' | 'sequence', file: File | null) => {
        setSelectedFiles(prev => ({
            ...prev,
            [tool]: {
                ...prev[tool],
                [type]: file
            }
        }));
    };

    const handleSubmit = async (tool: string, options: string) => {
        const files = selectedFiles[tool];
        if (!files.model || !files.sequence) {
            setResults(prev => ({
                ...prev,
                [tool]: {
                    output: '',
                    error: 'Veuillez sélectionner les fichiers requis'
                }
            }));
            return;
        }

        const formData = new FormData();
        formData.append('model', files.model);
        formData.append('sequence', files.sequence);
        formData.append('options', options);

        try {
            const response = await fetch(`/api/hmm/${tool}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            setResults(prev => ({
                ...prev,
                [tool]: {
                    output: data.output,
                    error: data.error
                }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                [tool]: {
                    output: '',
                    error: 'Erreur lors de l\'exécution de la commande'
                }
            }));
        }
    };

    const handleGenseq = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const response = await fetch('/api/hmm/genseq', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            setResults(prev => ({
                ...prev,
                genseq: {
                    output: data.output,
                    error: data.error
                }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                genseq: {
                    output: '',
                    error: 'Erreur lors de l\'exécution de la commande'
                }
            }));
        }
    };

    return (
        <>
            <Navbar />
            <main className="container py-5">
                <h1 className="mb-4">Outils UMDHMM</h1>
                <div className="row g-4">
                    {/* Forward Algorithm */}
                    <div className="col-md-6">
                        <Card>
                            <h2 className="h4 mb-3">
                                <i className="fas fa-calculator me-2"></i>
                                testfor - Forward Algorithm
                            </h2>
                            <p className="text-muted mb-3">
                                Calcule la probabilité P(O|λ) qu'une séquence d'observations O soit générée par un modèle λ.
                                Utilise l'algorithme Forward pour une évaluation efficace.
                            </p>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit('testfor', '-v');
                            }}>
                                <div className="mb-3">
                                    <label className="form-label">Fichier modèle (.hmm)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".hmm"
                                        onChange={(e) => handleFileChange('testfor', 'model', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Fichier séquence (.seq)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".seq"
                                        onChange={(e) => handleFileChange('testfor', 'sequence', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Exécuter testfor
                                </button>
                            </form>
                            {results.testfor && (
                                <div className="mt-3">
                                    {results.testfor.error ? (
                                        <div className="alert alert-danger">{results.testfor.error}</div>
                                    ) : (
                                        <pre className="bg-light p-3 rounded">{results.testfor.output}</pre>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Viterbi Algorithm */}
                    <div className="col-md-6">
                        <Card>
                            <h2 className="h4 mb-3">
                                <i className="fas fa-code-branch me-2"></i>
                                testvit - Viterbi Algorithm
                            </h2>
                            <p className="text-muted mb-3">
                                Trouve la séquence d'états la plus probable pour une séquence d'observations donnée.
                                Implémente l'algorithme de Viterbi pour trouver le chemin optimal.
                            </p>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit('testvit', '-v');
                            }}>
                                <div className="mb-3">
                                    <label className="form-label">Fichier modèle (.hmm)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".hmm"
                                        onChange={(e) => handleFileChange('testvit', 'model', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Fichier séquence (.seq)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".seq"
                                        onChange={(e) => handleFileChange('testvit', 'sequence', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Exécuter testvit
                                </button>
                            </form>
                            {results.testvit && (
                                <div className="mt-3">
                                    {results.testvit.error ? (
                                        <div className="alert alert-danger">{results.testvit.error}</div>
                                    ) : (
                                        <pre className="bg-light p-3 rounded">{results.testvit.output}</pre>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Baum-Welch Algorithm */}
                    <div className="col-md-6">
                        <Card>
                            <h2 className="h4 mb-3">
                                <i className="fas fa-sync me-2"></i>
                                testbw - Baum-Welch Algorithm
                            </h2>
                            <p className="text-muted mb-3">
                                Ré-estime les paramètres d'un modèle HMM à partir d'une séquence d'observations.
                                Utilise l'algorithme de Baum-Welch pour l'apprentissage.
                            </p>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const iterations = (e.target as any).iterations.value;
                                const threshold = (e.target as any).threshold.value;
                                handleSubmit('testbw', `-i ${iterations} -t ${threshold} -v`);
                            }}>
                                <div className="mb-3">
                                    <label className="form-label">Fichier modèle initial (.hmm)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".hmm"
                                        onChange={(e) => handleFileChange('testbw', 'model', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Fichier séquence d'apprentissage (.seq)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".seq"
                                        onChange={(e) => handleFileChange('testbw', 'sequence', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Nombre d'itérations</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="iterations"
                                        defaultValue="100"
                                        min="1"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Seuil de convergence</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="threshold"
                                        defaultValue="0.001"
                                        step="0.0001"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Exécuter testbw
                                </button>
                            </form>
                            {results.testbw && (
                                <div className="mt-3">
                                    {results.testbw.error ? (
                                        <div className="alert alert-danger">{results.testbw.error}</div>
                                    ) : (
                                        <pre className="bg-light p-3 rounded">{results.testbw.output}</pre>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Estimation HMM */}
                    <div className="col-md-6">
                        <Card>
                            <h2 className="h4 mb-3">
                                <i className="fas fa-chart-line me-2"></i>
                                esthmm - Estimation HMM
                            </h2>
                            <p className="text-muted mb-3">
                                Estime les paramètres initiaux d'un modèle HMM à partir d'une séquence d'observations et d'états.
                                Calcule les probabilités de transition et d'émission.
                            </p>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit('esthmm', '-v');
                            }}>
                                <div className="mb-3">
                                    <label className="form-label">Fichier séquence d'états (.sta)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".sta"
                                        onChange={(e) => handleFileChange('esthmm', 'model', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Fichier séquence d'observations (.seq)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".seq"
                                        onChange={(e) => handleFileChange('esthmm', 'sequence', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Exécuter esthmm
                                </button>
                            </form>
                            {results.esthmm && (
                                <div className="mt-3">
                                    {results.esthmm.error ? (
                                        <div className="alert alert-danger">{results.esthmm.error}</div>
                                    ) : (
                                        <pre className="bg-light p-3 rounded">{results.esthmm.output}</pre>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Generate Sequence */}
                    <div className="col-md-6">
                        <Card>
                            <h2 className="h4 mb-3">
                                <i className="fas fa-random me-2"></i>
                                genseq - Génération de Séquences
                            </h2>
                            <p className="text-muted mb-3">
                                Génère une séquence d'observations aléatoire à partir d'un modèle HMM.
                                Utile pour tester et valider les modèles.
                            </p>
                            <form onSubmit={handleGenseq}>
                                <div className="mb-3">
                                    <label className="form-label">Fichier modèle (.hmm)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        name="model"
                                        accept=".hmm"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Longueur de la séquence</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="length"
                                        defaultValue="100"
                                        min="1"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Exécuter genseq
                                </button>
                            </form>
                            {results.genseq && (
                                <div className="mt-3">
                                    {results.genseq.error ? (
                                        <div className="alert alert-danger">{results.genseq.error}</div>
                                    ) : (
                                        <pre className="bg-light p-3 rounded">{results.genseq.output}</pre>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}; 