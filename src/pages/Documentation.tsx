import React from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Card } from '../components/shared/Card';

interface Script {
    name: string;
    description: string;
    usage: string;
    options: Array<{
        flag: string;
        description: string;
    }>;
    example: string;
    outputFormat: string;
}

const scripts: Script[] = [
    {
        name: "testfor",
        description: "Implémente l'algorithme Forward pour calculer la probabilité qu'une séquence d'observations soit générée par un modèle HMM donné. Cet algorithme utilise la programmation dynamique pour calculer efficacement P(O|λ).",
        usage: "./testfor [options] fichier_modele fichier_sequence",
        options: [
            {
                flag: "-v",
                description: "Mode verbeux : affiche les détails des calculs"
            },
            {
                flag: "-d",
                description: "Active le mode debug avec plus d'informations"
            }
        ],
        example: "./testfor -v model.hmm sequence.seq",
        outputFormat: `Sortie standard :
P(O|λ) = 0.0123
Log[P(O|λ)] = -4.3982`
    },
    {
        name: "testvit",
        description: "Implémente l'algorithme de Viterbi pour trouver la séquence d'états la plus probable qui pourrait avoir généré une séquence d'observations donnée. Utilise le principe de programmation dynamique pour trouver le chemin optimal.",
        usage: "./testvit [options] fichier_modele fichier_sequence",
        options: [
            {
                flag: "-v",
                description: "Mode verbeux : montre le tracé du chemin"
            },
            {
                flag: "-p",
                description: "Affiche les probabilités pour chaque état"
            }
        ],
        example: "./testvit -v model.hmm sequence.seq",
        outputFormat: `Sortie standard :
Séquence d'états : 1 2 2 3 1
Probabilité : 0.0234
Log-probabilité : -3.7549`
    },
    {
        name: "testbw",
        description: "Implémente l'algorithme de Baum-Welch pour ré-estimer les paramètres d'un modèle HMM. Utilise l'algorithme EM (Expectation-Maximization) pour optimiser les paramètres du modèle en maximisant la probabilité des observations.",
        usage: "./testbw [options] fichier_modele fichier_sequence",
        options: [
            {
                flag: "-i N",
                description: "Nombre maximum d'itérations (défaut: 100)"
            },
            {
                flag: "-t ε",
                description: "Seuil de convergence (défaut: 0.001)"
            },
            {
                flag: "-v",
                description: "Mode verbeux : affiche les paramètres à chaque itération"
            }
        ],
        example: "./testbw -i 200 -t 0.0001 -v model.hmm sequence.seq",
        outputFormat: `Sortie standard :
Itération 1: Log-probabilité = -234.567
Itération 2: Log-probabilité = -230.123
...
Convergence atteinte après N itérations
Modèle final sauvegardé dans model_trained.hmm`
    }
];

export const Documentation: React.FC = () => {
    return (
        <>
            <Navbar />
            <main className="container py-5">
                <h1 className="display-4 mb-4">Documentation UMDHMM</h1>
                <p className="lead mb-5">
                    Guide détaillé des scripts disponibles dans UMDHMM et leur utilisation.
                </p>

                {scripts.map((script, index) => (
                    <Card key={index} className="mb-4">
                        <h2 className="h3 mb-3">
                            <i className="fas fa-terminal me-2"></i>
                            {script.name}
                        </h2>
                        
                        <h3 className="h5 mb-2">Description</h3>
                        <p className="mb-4">{script.description}</p>

                        <h3 className="h5 mb-2">Utilisation</h3>
                        <div className="bg-light p-3 rounded mb-3">
                            <code>{script.usage}</code>
                        </div>

                        <h3 className="h5 mb-2">Options</h3>
                        <table className="table table-sm mb-4">
                            <thead>
                                <tr>
                                    <th>Option</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {script.options.map((option, i) => (
                                    <tr key={i}>
                                        <td><code>{option.flag}</code></td>
                                        <td>{option.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h3 className="h5 mb-2">Exemple</h3>
                        <div className="bg-light p-3 rounded mb-3">
                            <code>{script.example}</code>
                        </div>

                        <h3 className="h5 mb-2">Format de sortie</h3>
                        <pre className="bg-light p-3 rounded mb-0">
                            {script.outputFormat}
                        </pre>
                    </Card>
                ))}
            </main>
        </>
    );
};
