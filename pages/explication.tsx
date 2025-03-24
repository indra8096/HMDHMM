import React from 'react';
import Head from 'next/head';
import { Navbar } from '../src/components/shared/Navbar';
import { useEffect, useState } from 'react';

export default function Explication() {
    const [isMounted, setIsMounted] = useState(false);
    const [sequence, setSequence] = useState<Array<{day: number, state: string, stateCode: number}>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initialState, setInitialState] = useState("0");
    const [sequenceLength, setSequenceLength] = useState(10);
    const [transitionMatrix, setTransitionMatrix] = useState({
        terreTerre: "0.0", terreLune: "0.6", terreMars: "0.4",
        luneTerre: "0.0", luneLune: "0.8", luneMars: "0.2",
        marsTerre: "0.0", marsLune: "0.6", marsMars: "0.4"
    });
    const [isSimulationReady, setIsSimulationReady] = useState(false);
    const [simulationUrl, setSimulationUrl] = useState("");
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Calculer les statistiques de la séquence
    const calculateStats = () => {
        if (sequence.length === 0) return { terre: 0, lune: 0, mars: 0, total: 0 };
        
        const counts = {
            'Terre': 0,
            'Lune': 0,
            'Mars': 0
        };
        
        sequence.forEach(item => {
            if (counts[item.state as keyof typeof counts] !== undefined) {
                counts[item.state as keyof typeof counts]++;
            }
        });
        
        return {
            terre: counts['Terre'],
            lune: counts['Lune'],
            mars: counts['Mars'],
            total: sequence.length
        };
    };
    
    const stats = calculateStats();
    
    const generateSequence = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/markov/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initialState,
                    length: sequenceLength
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la génération de la séquence');
            }
            
            setSequence(data.sequence || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const stateColors = {
        "Terre": "bg-success",
        "Lune": "bg-info",
        "Mars": "bg-danger"
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Construction de la chaîne de matrice de transition
        const matrixString = `${transitionMatrix.terreTerre},${transitionMatrix.terreLune},${transitionMatrix.terreMars},` +
                           `${transitionMatrix.luneTerre},${transitionMatrix.luneLune},${transitionMatrix.luneMars},` +
                           `${transitionMatrix.marsTerre},${transitionMatrix.marsLune},${transitionMatrix.marsMars}`;
        
        try {
            const response = await fetch(`/api/generate-simulation?initialState=${initialState}&matrix=${matrixString}`);
            if (response.ok) {
                const data = await response.json();
                setSimulationUrl(data.url);
                setIsSimulationReady(true);
            } else {
                alert("Erreur lors de la génération de la simulation");
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de la génération de la simulation");
        }
    };

    // Fonction pour mettre à jour une valeur de la matrice de transition
    const updateTransitionValue = (key: string, value: string) => {
        // Valider que la valeur est un nombre entre 0 et 1
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 1) {
            return; // Ne pas mettre à jour si la valeur n'est pas valide
        }
        
        setTransitionMatrix({
            ...transitionMatrix,
            [key]: value
        });
    };

    return (
        <div>
            <Head>
                <title>Explication des modèles HMM - UMDHMM</title>
                <meta name="description" content="Explication des modèles de Markov cachés" />
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
                <h1 className="mb-4">Comment fonctionne le modèle HMM ?</h1>
                
                <div className="card mb-4">
                    <div className="card-body">
                        <p>Tout d'abord, on doit se placer dans un contexte. Imaginons que vous êtes astronaute.</p>
                        <p>Vous avez un robot qui vous accompagne dans l'espace.</p>
                        <p>Ce robot est très intelligent et peut effectuer des actions tout seul.</p>
                        <p>Disons qu'il part de la planète initiale, la Terre.</p>
                        <p>Il est capable de décider d'aller sur une autre planète.</p>
                        <p>Il peut aller sur Mars, sur la Lune ou bien rester sur la Terre.</p>
                    </div>
                </div>
                
                <h2 className="h4 mb-3">
                    <i className="fas fa-project-diagram me-2"></i>
                    Modèle de transition du robot
                </h2>
                <p>Voici les probabilités de transition entre les planètes :</p>
                
                <div className="card mb-4">
                    <div className="card-body">
                        <ul>
                            <li><strong>Depuis la Terre :</strong> 60% de chance d'aller sur la Lune, 40% de chance d'aller sur Mars</li>
                            <li><strong>Depuis la Lune :</strong> 80% de chance de rester sur la Lune, 20% de chance d'aller sur Mars</li>
                            <li><strong>Depuis Mars :</strong> 40% de chance de rester sur Mars, 60% de chance d'aller sur la Lune</li>
                        </ul>
                    </div>
                </div>

                
                
                <div className="card mb-4">
                    <div className="card-body text-center">
                        {isMounted && (
                            <iframe 
                                src="/robot_transitions.html" 
                                width="650" 
                                height="450" 
                                style={{border: 'none', maxWidth: '100%'}}
                                title="Visualisation des transitions du robot"
                            ></iframe>
                        )}
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-body">
                        <h2 className='h4 mb-3'>La première propriété des chaines de Markov</h2>
                        <p>La propriété la plus importante d'un modèle de Markov est que l'état futur ne dépend que de l'état actuel et non des étapes précédentes.</p>
                        <p>Mahématiquement nous pouvons dire que P(Xn+1 = x | X1 = x1, X2 = x2, ..., Xn = xn) </p>
                        <p>En francais ca donne, la probabilité que n+1 = x étape soit x ne dépend que de la nième étape et non de la séquence complète des étapes qui ont procédé n.</p>
                        <p>A première vue, cela peut ne pas sembler si impressionnant, mais en regardant de plus près nous pouvons voir cette propriété.</p>
                        <p>P(Xn+1=x | Xn = xn) </p>
                        <p>Cette propriété nous facilité grandement la vie pendant que nous abordons des problèmes complexes du monde réel.</p>
                        <p>Comrpenons-le un peu mieux supposons que :</p>
                        <p>Le robot est fait (terre:jour1), (lune:jour2), (terre:jour3)</p>
                        <p>Quelle est la probabilité que le robot soit sur mars le jour 4 ?</p>
                        <p>Ce qui nous donnera :</p>
                        <p>P(X4 = mars | X1 = terre, X2 = lune, X3 = terre) = P(X4 = lune | X3 = terre)</p>
                        <p>On devra uniquement regarder le troisième jour et il s'avère que c'est 0.4</p>
                        <p>C'est le coeur des chaines de Markov.</p>
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-body">
                        <h2 className='h4 mb-3'>La seconde propriété des chaines de Markov</h2>
                        <p>La somme des poids des flèches sortantes de n'importe quel état est égale à 1.</p>
                        <p>Pourquoi ? Parce qu'elles représentent des probabilités et pour que les probabilités aient un sens, elles doivent totaliser 1</p>
                        <p>Pour ici, je vais vous dire qu'il existe certaines chaines de Markov avec des propriétés spéciales mais elles mériteront des explications à part entière.</p>
                        <p>Réalisons un petit qui génère des séquences aléatoires</p>
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-body">
                        <h2 className='h4 mb-3'>
                            <i className="fas fa-random me-2"></i>
                            Générateur de séquences aléatoires
                        </h2>
                        <p>Observez comment notre modèle de Markov génère des séquences aléatoires en fonction des probabilités de transition.</p>
                        
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="initialState" className="form-label">État initial:</label>
                                    <select 
                                        id="initialState"
                                        className="form-select"
                                        value={initialState}
                                        onChange={(e) => setInitialState(e.target.value)}
                                    >
                                        <option value="0">Terre</option>
                                        <option value="1">Lune</option>
                                        <option value="2">Mars</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="sequenceLength" className="form-label">Longueur de la séquence:</label>
                                    <select 
                                        id="sequenceLength"
                                        className="form-select"
                                        value={sequenceLength}
                                        onChange={(e) => setSequenceLength(parseInt(e.target.value))}
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i+1} value={i+1}>{i+1}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-grid gap-2 mb-4">
                            <button 
                                className="btn btn-primary" 
                                onClick={generateSequence}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Génération en cours...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-random me-2"></i>
                                        Générer une séquence
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {error && (
                            <div className="alert alert-danger">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        )}
                        
                        {sequence.length > 0 && (
                            <div>
                                <h5>Résultat de la simulation:</h5>
                                <div className="d-flex flex-nowrap overflow-auto">
                                    {sequence.map((item, index) => (
                                        <div 
                                            key={index} 
                                            className={`card ${stateColors[item.state as keyof typeof stateColors]} text-white me-2`}
                                            style={{ minWidth: '90px', maxWidth: '90px' }}
                                        >
                                            <div className="card-body p-2 text-center">
                                                <h5 className="card-title mb-1">Jour {item.day}</h5>
                                                <p className="card-text mb-0">{item.state}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {sequence.length > 0 && (
                    <div className="card mb-4">
                        <div className="card-body">
                            <h2 className='h4 mb-3'>
                                <i className="fas fa-chart-pie me-2"></i>
                                Statistiques de la séquence générée
                            </h2>
                            <p>Voici les probabilités observées dans la séquence générée :</p>
                            
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <div className={`card bg-success text-white mb-2`}>
                                        <div className="card-body p-3">
                                            <h5 className="card-title">Terre</h5>
                                            <p className="card-text fs-4">{stats.terre} / {stats.total} = {(stats.terre / stats.total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className={`card bg-info text-white mb-2`}>
                                        <div className="card-body p-3">
                                            <h5 className="card-title">Lune</h5>
                                            <p className="card-text fs-4">{stats.lune} / {stats.total} = {(stats.lune / stats.total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className={`card bg-danger text-white mb-2`}>
                                        <div className="card-body p-3">
                                            <h5 className="card-title">Mars</h5>
                                            <p className="card-text fs-4">{stats.mars} / {stats.total} = {(stats.mars / stats.total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <p>Comment les trouver ? C'est assez simple : il suffit de diviser le nombre d'occurrences d'un élément par le nombre total de jours.</p>
                            <p>Il est évident que si nous changeons le nombre d'étapes alors ces probabilités varieront mais nous sommes intéressés par ce qui se passe à long terme.</p>
                            <p>Ces probabilités convergent-elles vers des valeurs fixes ou continuent-elles à changer pour toujours ?</p>
                            <p>Pour répondre à cette question, nous allons faire une simulation avec 1000 étapes.</p>
                        </div>

                        <div className="card mb-4">
                            <div className="card-body">
                                <h2 className='h4 mb-3'>
                                    <i className="fas fa-chart-line me-2"></i>
                                    Simulation sur 1000 étapes
                                </h2>
                                <p>Cette simulation interactive vous permet d'observer l'évolution des probabilités sur une longue période (1000 étapes).</p>
                                <p>Vous pouvez contrôler la vitesse de la simulation et naviguer à n'importe quelle étape pour observer les résultats.</p>
                                
                                {isMounted && (
                                    <div className="text-center mt-4">
                                        <iframe 
                                            src="/markov_simulation_1000.html" 
                                            width="100%" 
                                            height="800" 
                                            style={{border: 'none', maxWidth: '100%'}}
                                            title="Simulation d'une chaîne de Markov sur 1000 étapes"
                                        ></iframe>
                                    </div>
                                )}
                                
                                <div className="mt-4">
                                    <h5>Observations importantes :</h5>
                                    <ul>
                                        <li>Notez comment les probabilités convergent vers des valeurs stables avec le temps</li>
                                        <li>Cette <strong>distribution stationnaire</strong> est une propriété fondamentale des chaînes de Markov</li>
                                        <li>Peu importe l'état initial, les probabilités convergent vers les mêmes valeurs</li>
                                        <li>Pour notre modèle, les valeurs théoriques de la distribution stationnaire sont :
                                            <ul>
                                                <li>Terre : 0%</li>
                                                <li>Lune : 75%</li>
                                                <li>Mars : 25%</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <h2 className="h4 mb-3">
                    <i className="fas fa-eye-slash me-2"></i>
                    Lien avec les modèles de Markov cachés
                </h2>
                <div className="card mb-4">
                    <div className="card-body">
                        <p>
                            Dans cet exemple, les états (planètes où se trouve le robot) sont des <strong>états observables</strong>. 
                            Dans un modèle de Markov caché (HMM), les états sont cachés, et nous observons seulement des émissions 
                            produites à partir de ces états.
                        </p>
                        <p>
                            Si nous ne pouvions pas voir directement sur quelle planète se trouve le robot, mais que nous pouvions seulement
                            observer certains signaux (comme la température, le type de données qu'il envoie, etc.), alors nous aurions
                            un véritable modèle de Markov caché.
                        </p>
                        <p>
                            Les modèles HMM sont utilisés dans de nombreux domaines comme :
                        </p>
                        <ul>
                            <li>La reconnaissance vocale</li>
                            <li>La bioinformatique (analyse de séquences ADN et protéiques)</li>
                            <li>La reconnaissance de gestes</li>
                            <li>L'analyse de séries temporelles</li>
                        </ul>
                    </div>
                </div>

                <div className="card mb-4">
                    <div className="card-body">
                        <h2 className="card-title"><i className="fas fa-sliders me-2"></i>Personnaliser votre simulation</h2>
                        <p>
                            Vous pouvez définir votre propre modèle de transition et état initial pour la simulation.
                            Assurez-vous que la somme des probabilités pour chaque état de départ est égale à 1.
                        </p>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">État initial</label>
                                <select 
                                    className="form-select" 
                                    value={initialState} 
                                    onChange={(e) => setInitialState(e.target.value)}
                                >
                                    <option value="0">Terre</option>
                                    <option value="1">Lune</option>
                                    <option value="2">Mars</option>
                                </select>
                            </div>
                            
                            <div className="card mb-3">
                                <div className="card-header bg-success text-white">
                                    <h5 className="mb-0">Depuis Terre</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <label className="form-label">Terre → Terre</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="1" 
                                                step="0.1"
                                                className="form-control" 
                                                value={transitionMatrix.terreTerre} 
                                                onChange={(e) => updateTransitionValue('terreTerre', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Terre → Lune</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="1" 
                                                step="0.1"
                                                className="form-control" 
                                                value={transitionMatrix.terreLune} 
                                                onChange={(e) => updateTransitionValue('terreLune', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Terre → Mars</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="1" 
                                                step="0.1"
                                                className="form-control" 
                                                value={transitionMatrix.terreMars} 
                                                onChange={(e) => updateTransitionValue('terreMars', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card mb-3">
                                <div className="card-header bg-info text-white">
                                    <h5 className="mb-0">Depuis Lune</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <label className="form-label">Lune → Terre</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="1" 
                                                step="0.1"
                                                className="form-control" 
                                                value={transitionMatrix.luneTerre} 
                                                onChange={(e) => updateTransitionValue('luneTerre', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Lune → Lune</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="1" 
                                                step="0.1"
                                                className="form-control" 
                                                value={transitionMatrix.luneLune} 
                                                onChange={(e) => updateTransitionValue('luneLune', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Lune → Mars</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="1" 
                                                step="0.1"
                                                className="form-control" 
                                                value={transitionMatrix.luneMars} 
                                                onChange={(e) => updateTransitionValue('luneMars', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card mb-3">
                                <div className="card-header bg-danger text-white">
                                    <h5 className="mb-0">Depuis Mars</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <label className="form-label">Mars → Terre</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="1" 
                                                step="0.1"
                                                className="form-control" 
                                                value={transitionMatrix.marsTerre} 
                                                onChange={(e) => updateTransitionValue('marsTerre', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Mars → Lune</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="1" 
                                                step="0.1"
                                                className="form-control" 
                                                value={transitionMatrix.marsLune} 
                                                onChange={(e) => updateTransitionValue('marsLune', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Mars → Mars</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="1" 
                                                step="0.1"
                                                className="form-control" 
                                                value={transitionMatrix.marsMars} 
                                                onChange={(e) => updateTransitionValue('marsMars', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary">
                                Générer la simulation
                            </button>
                        </form>
                        
                        {isSimulationReady && (
                            <div className="mt-4">
                                <div className="alert alert-success">
                                    Simulation générée ! Cliquez sur le bouton ci-dessous pour la visualiser.
                                </div>
                                <a 
                                    href={simulationUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-success"
                                >
                                    Voir la simulation
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
