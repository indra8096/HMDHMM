import React, { useState } from 'react';
import { Card } from '../../components/shared/Card';


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
    const [options, setOptions] = useState<Record<string, string>>({
        testfor: '',
        testvit: '',
        testbw: '',
        esthmm: ''
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

    const handleOptionsChange = (tool: string, value: string) => {
        setOptions(prev => ({
            ...prev,
            [tool]: value
        }));
    };

    const handleSubmit = async (tool: string) => {
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

        // Réinitialise les résultats précédents
        setResults(prev => ({
            ...prev,
            [tool]: {
                output: 'Chargement...',
                error: undefined
            }
        }));

        const formData = new FormData();
        formData.append('files', files.model);
        formData.append('files', files.sequence);
        formData.append('options', options[tool]);

        try {
            const response = await fetch(`/api/hmm/${tool}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();

            if (tool === 'testvit' && !data.error) {
                try {
                    const alignFormData = new FormData();
                    alignFormData.append('sequence', files.sequence);
                    alignFormData.append('states', new File([data.output], 'states.sta'));

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
                } catch (alignError) {
                    setResults(prev => ({
                        ...prev,
                        [tool]: {
                            output: data.output,
                            error: `Résultat obtenu, mais erreur lors de l'alignement: ${
                                alignError instanceof Error ? alignError.message : 'Erreur inconnue'
                            }`
                        }
                    }));
                }
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
                    error: `Erreur lors de l'exécution de ${tool}: ${
                        error instanceof Error ? error.message : 'Erreur inconnue'
                    }`
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
            const response = await fetch('/api/hmm/align', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `Erreur ${response.status}`);
            }

            if (data.error) {
                throw new Error(data.error);
            }

            setResults(prev => ({
                ...prev,
                conversion: {
                    output: data.output || 'Aucune sortie reçue'
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
        <div>
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
                                    <div className="bg-dark text-light p-3 rounded" style={{ fontFamily: 'monospace', whiteSpace: 'pre', overflowX: 'auto' }}>
                                        {results.conversion.output}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Forward Algorithm Tool */}
                <div className="col-md-6">
                    <Card>
                        <h2 className="h4 mb-3">
                            <i className="fas fa-arrow-right me-2"></i>
                            Algorithme Forward
                        </h2>
                        <p className="text-muted mb-3">
                            Calcule la probabilité P(O|λ) qu'une séquence d'observations O soit générée par un modèle λ.
                        </p>
                        <div className="mb-3">
                            <label className="form-label">Fichier du modèle HMM</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept=".hmm"
                                onChange={(e) => handleFileChange('testfor', 'model', e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Fichier de séquence</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept=".seq,.fasta,.fa"
                                onChange={(e) => handleFileChange('testfor', 'sequence', e.target.files?.[0] || null)}
                            />
                        </div>
                        <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={() => handleSubmit('testfor')}
                        >
                            <i className="fas fa-play me-2"></i>
                            Exécuter Forward
                        </button>
                        
                        {results.testfor && (
                            <div className="mt-4">
                                {results.testfor.error ? (
                                    <div className="alert alert-danger">
                                        {results.testfor.error}
                                    </div>
                                ) : (
                                    <div className="bg-dark text-light p-3 rounded" style={{ fontFamily: 'monospace', whiteSpace: 'pre', overflowX: 'auto' }}>
                                        {results.testfor.output}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Viterbi Algorithm Tool */}
                <div className="col-md-6">
                    <Card>
                        <h2 className="h4 mb-3">
                            <i className="fas fa-route me-2"></i>
                            Algorithme de Viterbi (Testvit)
                        </h2>
                        <p className="text-muted mb-3">
                            Trouve la séquence d'états la plus probable pour une séquence d'observations donnée.
                        </p>
                        <div className="mb-3">
                            <label className="form-label">Fichier du modèle HMM</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept=".hmm"
                                onChange={(e) => handleFileChange('testvit', 'model', e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Fichier de séquence</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept=".seq,.fasta,.fa"
                                onChange={(e) => handleFileChange('testvit', 'sequence', e.target.files?.[0] || null)}
                            />
                        </div>
                        <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={() => handleSubmit('testvit')}
                        >
                            <i className="fas fa-play me-2"></i>
                            Exécuter Viterbi
                        </button>
                        
                        {results.testvit && (
                            <div className="mt-4">
                                {results.testvit.error ? (
                                    <div className="alert alert-danger">
                                        {results.testvit.error}
                                    </div>
                                ) : (
                                    <div className="bg-dark text-light p-3 rounded" style={{ fontFamily: 'monospace', whiteSpace: 'pre', overflowX: 'auto' }}>
                                        {results.testvit.output}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Baum-Welch Algorithm Tool */}
                <div className="col-md-6">
                    <Card>
                        <h2 className="h4 mb-3">
                            <i className="fas fa-sync-alt me-2"></i>
                            Algorithme Baum-Welch (esthmm)
                        </h2>
                        <p className="text-muted mb-3">
                            Ré-estime les paramètres d'un modèle HMM à partir d'une séquence d'observations.
                        </p>
                        <div className="mb-3">
                            <label className="form-label">Fichier du modèle HMM</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept=".hmm"
                                onChange={(e) => handleFileChange('testbw', 'model', e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Fichier de séquence</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept=".seq,.fasta,.fa"
                                onChange={(e) => handleFileChange('testbw', 'sequence', e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Options</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="-i iterations -t threshold -v"
                                value={options.testbw}
                                onChange={(e) => handleOptionsChange('testbw', e.target.value)}
                            />
                        </div>
                        <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={() => handleSubmit('testbw')}
                        >
                            <i className="fas fa-play me-2"></i>
                            Exécuter Baum-Welch
                        </button>
                        
                        {results.testbw && (
                            <div className="mt-4">
                                {results.testbw.error ? (
                                    <div className="alert alert-danger">
                                        {results.testbw.error}
                                    </div>
                                ) : (
                                    <div className="bg-dark text-light p-3 rounded" style={{ fontFamily: 'monospace', whiteSpace: 'pre', overflowX: 'auto' }}>
                                        {results.testbw.output}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}; 