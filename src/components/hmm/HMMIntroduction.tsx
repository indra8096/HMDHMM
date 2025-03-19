import React from 'react';
import { Card } from '../shared/Card';

export const HMMIntroduction: React.FC = () => {
    return (
        <div className="mb-5">
            <h2 className="display-5 mb-4">Introduction aux Modèles de Markov Cachés</h2>
            
            <div className="row">
                <div className="col-md-6 mb-4">
                    <Card>
                        <h3 className="h4 mb-3">Qu'est-ce qu'un HMM ?</h3>
                        <p>
                            Un Modèle de Markov Caché (HMM) est un modèle statistique où le système 
                            modélisé est supposé être un processus de Markov avec des états non observés 
                            (cachés) et des observations visibles.
                        </p>
                        <p>
                            C'est une extension des chaînes de Markov classiques où l'état du système 
                            n'est pas directement observable, mais des sorties dépendantes de l'état le sont.
                        </p>
                    </Card>
                </div>

                <div className="col-md-6 mb-4">
                    <Card>
                        <h3 className="h4 mb-3">Composants d'un HMM</h3>
                        <p>Un HMM est caractérisé par les éléments suivants :</p>
                        <ul className="list-unstyled">
                            <li className="mb-2">• N : Nombre d'états cachés dans le modèle</li>
                            <li className="mb-2">• M : Nombre de symboles observables distincts</li>
                            <li className="mb-2">• A : Matrice de transition entre états</li>
                            <li className="mb-2">• B : Matrice d'émission des symboles</li>
                            <li className="mb-2">• π : Distribution initiale des états</li>
                        </ul>
                    </Card>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <Card>
                        <h3 className="h4 mb-3">Applications des HMM</h3>
                        <div className="row">
                            <div className="col-md-6">
                                <h4 className="h5 mb-3">En bioinformatique</h4>
                                <ul>
                                    <li>Analyse de séquences ADN</li>
                                    <li>Prédiction de gènes</li>
                                    <li>Alignement de séquences</li>
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <h4 className="h5 mb-3">Autres domaines</h4>
                                <ul>
                                    <li>Reconnaissance vocale</li>
                                    <li>Traitement du langage naturel</li>
                                    <li>Analyse de séries temporelles</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}; 