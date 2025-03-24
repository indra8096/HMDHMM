import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { initialState, matrix } = req.query;
    
    if (!initialState || !matrix) {
      return res.status(400).json({ error: 'Les paramètres initialState et matrix sont requis' });
    }

    // Valider l'état initial
    const initialStateNum = parseInt(initialState as string);
    if (isNaN(initialStateNum) || initialStateNum < 0 || initialStateNum > 2) {
      return res.status(400).json({ error: 'État initial invalide. Doit être 0, 1 ou 2' });
    }

    // Valider la matrice de transition
    const matrixValues = (matrix as string).split(',').map(v => parseFloat(v));
    if (matrixValues.length !== 9 || matrixValues.some(v => isNaN(v) || v < 0 || v > 1)) {
      return res.status(400).json({ error: 'La matrice de transition doit contenir 9 valeurs entre 0 et 1' });
    }

    // Générer un nom de fichier unique avec un timestamp
    const timestamp = Date.now();
    const outputFile = `markov_simulation_${timestamp}.html`;
    const publicDir = path.join(process.cwd(), 'public');
    
    // S'assurer que le répertoire public existe
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const outputPath = path.join(publicDir, outputFile);
    
    // Construire la commande avec des chemins absolus
    const toolsPath = path.join(process.cwd(), 'tools');
    const executablePath = path.join(toolsPath, 'markov_long_sim');
    
    // Vérifier que l'exécutable existe
    if (!fs.existsSync(executablePath)) {
      console.error('Exécutable non trouvé:', executablePath);
      return res.status(500).json({ error: 'Exécutable non trouvé' });
    }
    
    const command = `${executablePath} ${initialStateNum} 1000 "${outputPath}" "${matrix}"`;
    
    console.log('Exécution de la commande:', command);
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      console.error('Erreur lors de la génération de la simulation:', stderr);
      return res.status(500).json({ error: 'Erreur lors de la génération de la simulation' });
    }
    
    // Vérifier que le fichier a bien été créé
    if (!fs.existsSync(outputPath)) {
      console.error('Fichier de sortie non créé:', outputPath);
      return res.status(500).json({ error: 'Fichier de sortie non créé' });
    }
    
    console.log('Simulation générée avec succès:', outputPath);
    
    // Retourner l'URL de la simulation générée
    return res.status(200).json({ url: `/${outputFile}`, stdout });
    
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la génération de la simulation' });
  }
} 