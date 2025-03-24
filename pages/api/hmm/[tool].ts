import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import multer from 'multer';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Configuration pour multer
const upload = multer({
  dest: '/tmp/uploads/'
});

// Helper pour gérer l'upload de fichiers
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Assurez-vous que le dossier d'upload existe
const ensureDir = async (dirPath: string) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Liste des outils autorisés
const validTools = ['testfor', 'testvit', 'testbw', 'esthmm', 'genseq'];

// Désactive le body parser par défaut de Next.js pour les fichiers
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Récupère le nom de l'outil depuis l'URL
  const { tool } = req.query;

  // Vérifie si l'outil est valide
  if (!tool || typeof tool !== 'string' || !validTools.includes(tool)) {
    return res.status(400).json({ error: 'Outil invalide ou non spécifié' });
  }

  try {
    // Crée le dossier d'upload si nécessaire
    const uploadDir = '/tmp/uploads';
    await ensureDir(uploadDir);

    // @ts-ignore
    await runMiddleware(req, res, upload.array('files', 2));

    // @ts-ignore
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Deux fichiers sont requis (modèle et séquence)' });
    }

    // Extraire les fichiers chargés
    // @ts-ignore
    const modelFile = req.files[0];
    // @ts-ignore
    const seqFile = req.files[1];

    // @ts-ignore
    const options = req.body?.options || '';

    // Renommer les fichiers avec des extensions appropriées
    const modelPath = join(uploadDir, `${modelFile.filename}.hmm`);
    const seqPath = join(uploadDir, `${seqFile.filename}.seq`);
    
    await fs.rename(modelFile.path, modelPath);
    await fs.rename(seqFile.path, seqPath);

    // Chemin vers l'outil
    const toolsDir = path.join(process.cwd(), 'tools');
    const toolPath = join(toolsDir, tool);

    // Assurez-vous que l'outil est exécutable
    try {
      await execAsync(`chmod +x ${toolPath}`);
    } catch (error) {
      console.error(`Erreur lors de la modification des permissions pour ${tool}:`, error);
    }

    // Exécute la commande
    const cmd = `${toolPath} ${options} ${modelPath} ${seqPath}`;
    console.log(`Exécution de la commande: ${cmd}`);
    
    const { stdout, stderr } = await execAsync(cmd);

    // Supprime les fichiers temporaires
    try {
      await fs.unlink(modelPath);
      await fs.unlink(seqPath);
    } catch (error) {
      console.error('Erreur lors de la suppression des fichiers temporaires:', error);
    }

    // Si c'est testbw, il génère un nouveau modèle, qu'il faut récupérer
    let outputModel = null;
    if (tool === 'testbw') {
      // Le fichier de sortie est généralement nommé avec le préfixe 're-estimated'
      const outputModelPath = join(uploadDir, `re-estimated_${modelFile.filename}.hmm`);
      try {
        if (await fs.stat(outputModelPath).then(() => true).catch(() => false)) {
          outputModel = await fs.readFile(outputModelPath, 'utf8');
          await fs.unlink(outputModelPath);
        }
      } catch (error) {
        console.error('Erreur lors de la lecture du modèle ré-estimé:', error);
      }
    }

    return res.status(200).json({ 
      output: stdout,
      error: stderr || null,
      model: outputModel
    });

  } catch (error) {
    console.error(`Erreur lors de l'exécution de ${tool}:`, error);
    return res.status(500).json({ 
      error: `Erreur lors de l'exécution de l'outil ${tool}`,
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 