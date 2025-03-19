import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { TestForRequest, GenSeqRequest, TestVitRequest, EstHMMRequest, ConvertRequest, APIResponse } from './types/hmm.types';

const app = express();

// Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

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

// Routes
app.get('/', (_req: Request, res: Response) => {
    res.render('index');
});

// API pour exécuter testfor (calcul des alpha)
app.post('/api/testfor', async (req: Request<{}, {}, TestForRequest>, res: Response<APIResponse>) => {
    try {
        const { hmmContent, seqContent } = req.body;
        const hmmFile = createTempFile(hmmContent, '.hmm');
        const seqFile = createTempFile(seqContent, '.seq');

        const result = await new Promise<string>((resolve, reject) => {
            exec(`./testfor ${hmmFile} ${seqFile}`, (error, stdout, stderr) => {
                // Nettoyage des fichiers temporaires
                fs.unlinkSync(hmmFile);
                fs.unlinkSync(seqFile);
                
                if (error) reject(error);
                resolve(stdout);
            });
        });
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        });
    }
});

// API pour exécuter genseq
app.post('/api/genseq', async (req: Request<{}, {}, GenSeqRequest>, res: Response<APIResponse>) => {
    try {
        const { hmmContent, length, seed } = req.body;
        const hmmFile = createTempFile(hmmContent, '.hmm');
        const outputFile = `sequence_${Date.now()}.seq`;
        const outputPath = path.join(tempDir, outputFile);

        const command = seed 
            ? `./genseq ${hmmFile} ${length} ${seed} > ${outputPath}`
            : `./genseq ${hmmFile} ${length} > ${outputPath}`;

        await new Promise<void>((resolve, reject) => {
            exec(command, (error) => {
                fs.unlinkSync(hmmFile);
                if (error) reject(error);
                resolve();
            });
        });

        const generatedContent = fs.readFileSync(outputPath, 'utf-8');
        fs.unlinkSync(outputPath);
        
        res.json({
            success: true,
            data: generatedContent,
            generatedFile: outputFile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        });
    }
});

// API pour exécuter testvit
app.post('/api/testvit', async (req: Request<{}, {}, TestVitRequest>, res: Response<APIResponse>) => {
    try {
        const { hmmContent, seqContent } = req.body;
        const hmmFile = createTempFile(hmmContent, '.hmm');
        const seqFile = createTempFile(seqContent, '.seq');

        const result = await new Promise<string>((resolve, reject) => {
            exec(`./testvit ${hmmFile} ${seqFile}`, (error, stdout, stderr) => {
                fs.unlinkSync(hmmFile);
                fs.unlinkSync(seqFile);
                
                if (error) reject(error);
                resolve(stdout);
            });
        });
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        });
    }
});

// API pour exécuter esthmm
app.post('/api/esthmm', async (req: Request<{}, {}, EstHMMRequest>, res: Response<APIResponse>) => {
    try {
        const { seqContent, N, M } = req.body;
        const seqFile = createTempFile(seqContent, '.seq');
        const outputFile = `model_${Date.now()}.hmm`;
        const outputPath = path.join(tempDir, outputFile);

        const result = await new Promise<string>((resolve, reject) => {
            exec(`./esthmm -N ${N} -M ${M} ${seqFile} > ${outputPath}`, (error, stdout, stderr) => {
                fs.unlinkSync(seqFile);
                if (error) reject(error);
                resolve(stdout);
            });
        });

        const generatedContent = fs.readFileSync(outputPath, 'utf-8');
        fs.unlinkSync(outputPath);
        
        res.json({
            success: true,
            data: generatedContent,
            generatedFile: outputFile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        });
    }
});

// API pour convertir numérique vers FASTA
app.post('/api/convert/to-fasta', async (req: Request<{}, {}, ConvertRequest>, res: Response<APIResponse>) => {
    try {
        const { content, sequenceName } = req.body;
        const inputFile = createTempFile(content, '.seq');
        const outputFile = `fasta_${Date.now()}.fa`;
        const outputPath = path.join(tempDir, outputFile);

        const command = sequenceName
            ? `python3 src/converters/converter.py to-fasta ${inputFile} ${outputPath} ${sequenceName}`
            : `python3 src/converters/converter.py to-fasta ${inputFile} ${outputPath}`;

        await new Promise<void>((resolve, reject) => {
            exec(command, (error) => {
                fs.unlinkSync(inputFile);
                if (error) reject(error);
                resolve();
            });
        });

        const convertedContent = fs.readFileSync(outputPath, 'utf-8');
        fs.unlinkSync(outputPath);
        
        res.json({
            success: true,
            data: convertedContent,
            generatedFile: outputFile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        });
    }
});

// API pour convertir FASTA vers numérique
app.post('/api/convert/to-numeric', async (req: Request<{}, {}, ConvertRequest>, res: Response<APIResponse>) => {
    try {
        const { content } = req.body;
        const inputFile = createTempFile(content, '.fa');
        const outputFile = `numeric_${Date.now()}.seq`;
        const outputPath = path.join(tempDir, outputFile);

        await new Promise<void>((resolve, reject) => {
            exec(`python3 src/converters/converter.py to-numeric ${inputFile} ${outputPath}`, (error) => {
                fs.unlinkSync(inputFile);
                if (error) reject(error);
                resolve();
            });
        });

        const convertedContent = fs.readFileSync(outputPath, 'utf-8');
        fs.unlinkSync(outputPath);
        
        res.json({
            success: true,
            data: convertedContent,
            generatedFile: outputFile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Une erreur est survenue'
        });
    }
});

// Route pour la page DNA
app.get('/dna', (_req: Request, res: Response) => {
    res.render('dna');
});

// API pour la conversion ADN
app.post('/api/dna/convert', async (req: Request<{}, {}, ConvertRequest>, res: Response<APIResponse>) => {
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 