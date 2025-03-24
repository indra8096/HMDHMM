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

  try {
    // Crée le dossier d'upload si nécessaire
    const uploadDir = '/tmp/uploads';
    await ensureDir(uploadDir);

    // @ts-ignore
    await runMiddleware(req, res, upload.single('sequence'));

    // @ts-ignore
    if (!req.file) {
      return res.status(400).json({ error: 'Le fichier de séquence est requis' });
    }

    // @ts-ignore
    const seqPath = join(uploadDir, `${req.file.filename}.fasta`);
    // @ts-ignore
    await fs.rename(req.file.path, seqPath);

    // Chemin vers l'outil d'alignement
    const toolsDir = path.join(process.cwd(), 'tools');
    const alignToolPath = join(toolsDir, 'align_sequences.py');

    // Rend l'exécutable exécutable si nécessaire
    try {
      await execAsync(`chmod +x ${alignToolPath}`);
    } catch (error) {
      console.error('Erreur lors de la modification des permissions:', error);
    }

    const { stdout, stderr } = await execAsync(`${alignToolPath} ${seqPath}`);

    if (stderr) {
      console.error('Stderr:', stderr);
    }

    // Supprime le fichier temporaire
    try {
      await fs.unlink(seqPath);
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
    }

    return res.status(200).json({ 
      output: stdout,
      error: stderr || null
    });

  } catch (error) {
    console.error('Erreur détaillée:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la conversion de la séquence',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : null
    });
  }
} 