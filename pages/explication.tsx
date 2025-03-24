import React from 'react';
import Head from 'next/head';
import { Navbar } from '../src/components/shared/Navbar';
import { useEffect, useState } from 'react';

export default function Explication() {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

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
            </main>
        </div>
    );
}
