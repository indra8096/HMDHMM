import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';

type SequenceItem = {
  day: number;
  state: string;
  stateCode: number;
};

type GenerationResponse = {
  sequence?: SequenceItem[];
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerationResponse>
) {
  // Accepter uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Récupérer les paramètres
  const { initialState = 0, length = 10 } = req.body;
  
  // Vérifier les limites
  if (initialState < 0 || initialState > 2) {
    return res.status(400).json({ error: 'L\'état initial doit être 0 (Terre), 1 (Lune) ou 2 (Mars)' });
  }
  
  if (length < 1 || length > 100) {
    return res.status(400).json({ error: 'La longueur doit être comprise entre 1 et 100' });
  }

  // Chemin vers le script shell
  const scriptPath = path.join(process.cwd(), 'tools', 'generate_sequence.sh');
  
  // Exécuter le script
  exec(`cd ${path.join(process.cwd(), 'tools')} && ./generate_sequence.sh ${initialState} ${length}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur d'exécution: ${error}`);
      return res.status(500).json({ error: `Erreur lors de la génération de la séquence: ${stderr}` });
    }
    
    try {
      // Parser la sortie JSON
      const result = JSON.parse(stdout);
      return res.status(200).json({ sequence: result.sequence });
    } catch (e) {
      console.error(`Erreur de parsing: ${e}`);
      return res.status(500).json({ error: 'Erreur lors du parsing des résultats' });
    }
  });
} 