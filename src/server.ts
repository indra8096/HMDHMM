import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { ConvertRequest, APIResponse } from './types/hmm.types';

const execAsync = promisify(exec);
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// Dossier temporaire pour les fichiers
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Fonction utilitaire pour créer un fichier temporaire
const createTempFile = (content: string, extension: string): string => {
    const fileName = `temp_${Date.now()}${extension}`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, content);
    return filePath;
};

// Fonction utilitaire pour exécuter une commande UMDHMM
async function executeUMDHMM(command: string): Promise<string> {
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            console.error('Stderr:', stderr);
        }
        return stdout;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Gestionnaire pour les fichiers temporaires
async function handleFiles(files: Express.Multer.File[], options: string = ''): Promise<{ modelPath: string; sequencePath: string }> {
    const modelPath = path.join('uploads', `${files[0].filename}.hmm`);
    const sequencePath = path.join('uploads', `${files[1].filename}.seq`);
    
    await Promise.all([
        fs.promises.rename(files[0].path, modelPath),
        fs.promises.rename(files[1].path, sequencePath)
    ]);

    return { modelPath, sequencePath };
}

// Routes
app.get('/', (_req: express.Request, res: express.Response) => {
    res.render('index');
});

// Route pour testfor
app.post('/api/hmm/testfor', upload.array('files'), async (req, res) => {
    try {
        const { modelPath, sequencePath } = await handleFiles(req.files as Express.Multer.File[]);
        const output = await executeUMDHMM(`./testfor -v ${modelPath} ${sequencePath}`);
        res.json({ output });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'exécution de testfor' });
    }
});

// Route pour testvit
app.post('/api/hmm/testvit', upload.array('files'), async (req, res) => {
    try {
        const { modelPath, sequencePath } = await handleFiles(req.files as Express.Multer.File[]);
        const output = await executeUMDHMM(`./testvit -v ${modelPath} ${sequencePath}`);
        res.json({ output });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'exécution de testvit' });
    }
});

// Route pour testbw
app.post('/api/hmm/testbw', upload.array('files'), async (req, res) => {
    try {
        const { modelPath, sequencePath } = await handleFiles(req.files as Express.Multer.File[]);
        const { iterations = 100, threshold = 0.001 } = req.body;
        const output = await executeUMDHMM(
            `./testbw -i ${iterations} -t ${threshold} -v ${modelPath} ${sequencePath}`
        );
        res.json({ output });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'exécution de testbw' });
    }
});

// Route pour esthmm
app.post('/api/hmm/esthmm', upload.array('files'), async (req, res) => {
    try {
        const { modelPath, sequencePath } = await handleFiles(req.files as Express.Multer.File[]);
        const output = await executeUMDHMM(`./esthmm -v ${modelPath} ${sequencePath}`);
        res.json({ output });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'exécution de esthmm' });
    }
});

// Route pour genseq
app.post('/api/hmm/genseq', upload.single('model'), async (req, res) => {
    try {
        const modelPath = path.join('uploads', `${req.file?.filename}.hmm`);
        await fs.promises.rename(req.file?.path as string, modelPath);
        
        const length = req.body.length || 100;
        const output = await executeUMDHMM(`./genseq ${modelPath} ${length}`);
        res.json({ output });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'exécution de genseq' });
    }
});

// Route pour l'alignement des séquences
app.post('/api/hmm/align', upload.single('sequence'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('Le fichier de séquence est requis');
        }

        console.log('Fichier reçu:', req.file);
        
        // Créer le dossier uploads s'il n'existe pas
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }

        const seqPath = path.join('uploads', `${req.file.filename}.fasta`);
        await fs.promises.rename(req.file.path, seqPath);
        console.log('Fichier renommé en:', seqPath);

        // Utilise le chemin absolu pour align_sequence
        const toolsDir = path.join(__dirname, '../tools');
        const alignToolPath = path.join(toolsDir, 'align_sequence');
        console.log('Chemin de l\'outil:', alignToolPath);
        console.log('Dossier actuel:', __dirname);
        console.log('Commande complète:', `${alignToolPath} ${seqPath}`);

        // Vérifie si l'exécutable existe
        if (!fs.existsSync(alignToolPath)) {
            throw new Error(`L'exécutable ${alignToolPath} n'existe pas`);
        }

        // Rend l'exécutable exécutable si nécessaire
        await execAsync(`chmod +x ${alignToolPath}`);

        const { stdout, stderr } = await execAsync(`${alignToolPath} ${seqPath}`);
        
        if (stderr) {
            console.error('Stderr:', stderr);
        }

        console.log('Sortie:', stdout);

        res.json({ 
            output: stdout,
            error: stderr || null
        });

    } catch (error) {
        console.error('Erreur complète:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la conversion de la séquence',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    } finally {
        // Nettoyage du fichier temporaire
        if (req.file) {
            const seqPath = path.join('uploads', `${req.file.filename}.fasta`);
            fs.unlink(seqPath, (err) => {
                if (err) console.error('Erreur lors de la suppression du fichier:', err);
            });
        }
    }
});

// Nettoyage périodique des fichiers temporaires
setInterval(async () => {
    try {
        const files = await fs.promises.readdir('uploads');
        const now = Date.now();
        for (const file of files) {
            const filePath = path.join('uploads', file);
            const stats = await fs.promises.stat(filePath);
            // Supprime les fichiers de plus de 1 heure
            if (now - stats.mtimeMs > 3600000) {
                await fs.promises.unlink(filePath);
            }
        }
    } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
    }
}, 3600000); // Vérifie toutes les heures

// Route pour la page DNA
app.get('/dna', (_req: express.Request, res: express.Response) => {
    res.render('dna');
});

// API pour la conversion ADN
app.post('/api/dna/convert', async (req: express.Request<{}, {}, ConvertRequest>, res: express.Response<APIResponse>) => {
    try {
        const { content, sequenceName } = req.body;
        const inputFile = createTempFile(content, '.txt');
        const outputFile = `dna_${Date.now()}.txt`;
        const outputPath = path.join(tempDir, outputFile);

        await new Promise<void>((resolve, reject) => {
            exec(`python3 src/converters/dna_converter.py ${inputFile} ${outputPath} "${sequenceName || 'seq'}"`, (error) => {
                fs.unlinkSync(inputFile);
                if (error) reject(error);
                resolve();
            });
        });

        const convertedContent = fs.readFileSync(outputPath, 'utf-8');
        fs.unlinkSync(outputPath);
        
        res.json({
            success: true,
            data: convertedContent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        });
    }
});

// Port d'écoute
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 