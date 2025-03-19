import React from 'react';
import { Card } from '../shared/Card';

interface Application {
    title: string;
    description: string;
    icon: string;
}

const applications: Application[] = [
    {
        title: "Bioinformatique",
        description: "Analyse de séquences ADN, prédiction de gènes, alignement de séquences",
        icon: "fas fa-dna"
    },
    {
        title: "Reconnaissance Vocale",
        description: "Modélisation acoustique, reconnaissance de la parole continue",
        icon: "fas fa-microphone"
    },
    {
        title: "Traitement du Langage",
        description: "Analyse syntaxique, étiquetage grammatical, traduction automatique",
        icon: "fas fa-language"
    },
    {
        title: "Finance",
        description: "Prédiction de marchés, analyse de séries temporelles financières",
        icon: "fas fa-chart-line"
    }
];

export const HMMApplications: React.FC = () => {
    return (
        <div className="mb-5">
            <h2 className="display-5 mb-4">Applications des HMM</h2>
            
            <div className="row">
                {applications.map((app, index) => (
                    <div key={index} className="col-md-3">
                        <Card>
                            <h3 className="h4 mb-3">
                                <i className={`${app.icon} me-2`}></i>
                                {app.title}
                            </h3>
                            <p>{app.description}</p>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}; 