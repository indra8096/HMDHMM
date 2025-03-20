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
    const [alignmentFiles, setAlignmentFiles] = useState<{
        sequence: File | null;
        states: File | null;
    }>({
        sequence: null,
        states: null
    });
    const [sequenceFile, setSequenceFile] = useState<File | null>(null);

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
        formData.append('files', files.model);
        formData.append('files', files.sequence);
        formData.append('options', options);

        try {
            const response = await fetch(`/api/hmm/${tool}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();

            if (tool === 'testvit' && !data.error) {
                const alignFormData = new FormData();
                alignFormData.append('files', files.sequence);
                alignFormData.append('files', new File([data.output], 'states.sta'));

                const alignResponse = await fetch('/api/hmm/align', {
                    method: 'POST',
                    body: alignFormData
                });

                const alignData = await alignResponse.json();
                
                setResults(prev => ({
                    ...prev,
                    [tool]: {
                        output: `Résultat Viterbi:\n${data.output}\n\nAlignement:\n${alignData.output}`,
                        error: alignData.error
                    }
                }));
            } else {
                setResults(prev => ({
                    ...prev,
                    [tool]: {
                        output: data.output,
                        error: data.error
                    }
                }));
            }
        } catch (error) {
            setResults(prev => ({
                ...prev,
                [tool]: {
                    output: '',
                    error: `Erreur lors de l'exécution de ${tool}`
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

    const handleAlignmentFileChange = (type: 'sequence' | 'states', file: File | null) => {
        setAlignmentFiles(prev => ({
            ...prev,
            [type]: file
        }));
    };

    const handleAlignment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!alignmentFiles.sequence || !alignmentFiles.states) {
            setResults(prev => ({
                ...prev,
                alignment: {
                    output: '',
                    error: 'Veuillez sélectionner les deux fichiers requis'
                }
            }));
            return;
        }

        const formData = new FormData();
        formData.append('sequence', alignmentFiles.sequence);
        formData.append('states', alignmentFiles.states);

        try {
            const response = await fetch('/api/hmm/align', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            setResults(prev => ({
                ...prev,
                alignment: {
                    output: data.output,
                    error: data.error
                }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                alignment: {
                    output: '',
                    error: 'Erreur lors de l\'alignement'
                }
            }));
        }
    };

    const handleSequenceFileChange = (file: File | null) => {
        setSequenceFile(file);
    };

    const handleConversion = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!sequenceFile) {
            setResults(prev => ({
                ...prev,
                conversion: {
                    output: '',
                    error: 'Veuillez sélectionner un fichier de séquence'
                }
            }));
            return;
        }

        // Réinitialise les résultats précédents
        setResults(prev => ({
            ...prev,
            conversion: {
                output: 'Chargement...',
                error: undefined
            }
        }));

        const formData = new FormData();
        formData.append('sequence', sequenceFile);

        try {
            console.log('Envoi du fichier:', sequenceFile.name, 'taille:', sequenceFile.size);
            
            // Utilise l'URL complète avec le port
            const response = await fetch('http://localhost:3001/api/hmm/align', {
                method: 'POST',
                body: formData
            });
            
            console.log('Statut de la réponse:', response.status);
            const data = await response.json();
            console.log('Réponse reçue:', data);
            
            if (!response.ok) {
                throw new Error(data.error || `Erreur ${response.status}`);
            }

            if (data.error) {
                throw new Error(data.error);
            }

            setResults(prev => ({
                ...prev,
                conversion: {
                    output: data.output || 'Aucune sortie reçue',
                    error: undefined
                }
            }));
        } catch (error) {
            console.error('Erreur complète:', error);
            setResults(prev => ({
                ...prev,
                conversion: {
                    output: '',
                    error: error instanceof Error ? error.message : 'Erreur lors de la conversion'
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
                    {/* Sequence Conversion Tool */}
                    <div className="col-md-6">
                        <Card>
                            <h2 className="h4 mb-3">
                                <i className="fas fa-exchange-alt me-2"></i>
                                Conversion Séquence → Numérique
                            </h2>
                            <p className="text-muted mb-3">
                                Convertit une séquence d'acides aminés en leurs indices numériques correspondants.
                                Affiche l'alignement et la correspondance.
                            </p>
                            <form onSubmit={handleConversion}>
                                <div className="mb-3">
                                    <label className="form-label">Fichier FASTA</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".fasta,.fa,.seq"
                                        onChange={(e) => handleSequenceFileChange(e.target.files?.[0] || null)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-align-left me-2"></i>
                                    Aligner
                                </button>
                            </form>
                            {results.conversion && (
                                <div className="mt-4">
                                    {results.conversion.error ? (
                                        <div className="alert alert-danger">
                                            {results.conversion.error}
                                        </div>
                                    ) : (
                                        <div className="bg-dark text-light p-3 rounded" style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
                                            {results.conversion.output}
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Alignment Tool */}
                    <div className="col-md-6">
                        <Card>
                            <h2 className="h4 mb-3">
                                <i className="fas fa-align-left me-2"></i>
                                Alignement Séquence-États
                            </h2>
                            <p className="text-muted mb-3">
                                Aligne une séquence de protéines avec ses états correspondants.
                                Affiche l'alignement dans un format lisible.
                            </p>
                            <form onSubmit={handleAlignment}>
                                <div className="mb-3">
                                    <label className="form-label">Fichier séquence (.seq)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".seq"
                                        onChange={(e) => handleAlignmentFileChange('sequence', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Fichier états (.sta)</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        accept=".sta"
                                        onChange={(e) => handleAlignmentFileChange('states', e.target.files?.[0] || null)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Aligner
                                </button>
                            </form>
                            {results.alignment && (
                                <div className="mt-3">
                                    {results.alignment.error ? (
                                        <div className="alert alert-danger">{results.alignment.error}</div>
                                    ) : (
                                        <div className="terminal bg-dark text-light p-3 rounded" style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
                                            {results.alignment.output}
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

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