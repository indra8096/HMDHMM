import React from 'react';
import { Card } from '../shared/Card';

interface Problem {
    title: string;
    description: string;
    solution: string;
}

const problems: Problem[] = [
    {
        title: "Problème 1: Évaluation",
        description: "Étant donné un modèle HMM λ = (A, B, π) et une séquence d'observations O, calculer P(O|λ), la probabilité de la séquence d'observations.",
        solution: "Solution: Algorithme Forward ou Backward"
    },
    {
        title: "Problème 2: Décodage",
        description: "Étant donné un modèle HMM λ = (A, B, π) et une séquence d'observations O, trouver la séquence d'états cachés la plus probable.",
        solution: "Solution: Algorithme de Viterbi"
    },
    {
        title: "Problème 3: Apprentissage",
        description: "Étant donné une séquence d'observations O, trouver les paramètres du modèle λ = (A, B, π) qui maximisent P(O|λ).",
        solution: "Solution: Algorithme de Baum-Welch"
    }
];

export const HMMProblems: React.FC = () => {
    return (
        <div className="mb-5">
            <h2 className="display-5 mb-4">Les Trois Problèmes Fondamentaux des HMM</h2>
            
            <div className="row">
                {problems.map((problem, index) => (
                    <div key={index} className="col-md-4">
                        <Card>
                            <h3 className="h4 mb-3">{problem.title}</h3>
                            <p className="card-text">
                                {problem.description}
                                <hr /> 
                                <small className="text-muted">
                                    {problem.solution}
                                </small>
                            </p>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}; 