document.addEventListener('DOMContentLoaded', () => {
    // Récupération des éléments du DOM
    const forms = {
        testFor: {
            form: document.getElementById('testForForm'),
            result: document.getElementById('testForResult')
        },
        genSeq: {
            form: document.getElementById('genSeqForm'),
            result: document.getElementById('genSeqResult')
        },
        testVit: {
            form: document.getElementById('testVitForm'),
            result: document.getElementById('testVitResult')
        },
        estHmm: {
            form: document.getElementById('estHmmForm'),
            result: document.getElementById('estHmmResult')
        }
    };

    // Fonction utilitaire pour lire un fichier
    const readFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    // Fonction pour afficher les résultats
    const displayResult = (element, data, error = false) => {
        element.textContent = error ? `Erreur: ${data}` : data;
        element.classList.add('show');
        if (error) {
            element.classList.add('error');
        } else {
            element.classList.remove('error');
        }
    };

    // Gestion de TestFor
    forms.testFor.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const hmmFile = document.getElementById('testForHmmFile').files[0];
        const seqFile = document.getElementById('testForSeqFile').files[0];
        
        try {
            const [hmmContent, seqContent] = await Promise.all([
                readFile(hmmFile),
                readFile(seqFile)
            ]);
            
            const response = await fetch('/api/testfor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hmmContent,
                    seqContent
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                displayResult(forms.testFor.result, data.data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            displayResult(forms.testFor.result, error.message, true);
        }
    });

    // Gestion de GenSeq
    forms.genSeq.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const hmmFile = document.getElementById('genSeqHmmFile').files[0];
        const length = document.getElementById('seqLength').value;
        const seed = document.getElementById('seed').value;
        
        try {
            const hmmContent = await readFile(hmmFile);
            
            const response = await fetch('/api/genseq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hmmContent,
                    length: parseInt(length),
                    seed: seed ? parseInt(seed) : undefined
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                displayResult(forms.genSeq.result, 
                    `Séquence générée (${data.generatedFile}):\n\n${data.data}`);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            displayResult(forms.genSeq.result, error.message, true);
        }
    });

    // Gestion de TestVit
    forms.testVit.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const hmmFile = document.getElementById('testVitHmmFile').files[0];
        const seqFile = document.getElementById('testVitSeqFile').files[0];
        
        try {
            const [hmmContent, seqContent] = await Promise.all([
                readFile(hmmFile),
                readFile(seqFile)
            ]);
            
            const response = await fetch('/api/testvit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hmmContent,
                    seqContent
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                displayResult(forms.testVit.result, data.data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            displayResult(forms.testVit.result, error.message, true);
        }
    });

    // Gestion de EstHMM
    forms.estHmm.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const seqFile = document.getElementById('estHmmSeqFile').files[0];
        const N = document.getElementById('numStates').value;
        const M = document.getElementById('alphabetSize').value;
        
        try {
            const seqContent = await readFile(seqFile);
            
            const response = await fetch('/api/esthmm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    seqContent,
                    N: parseInt(N),
                    M: parseInt(M)
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                displayResult(forms.estHmm.result, 
                    `Modèle HMM estimé (${data.generatedFile}):\n\n${data.data}`);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            displayResult(forms.estHmm.result, error.message, true);
        }
    });

    // Gestion de la conversion numérique vers FASTA
    const numToFastaForm = document.getElementById('numToFastaForm');
    const numToFastaResult = document.getElementById('numToFastaResult');

    numToFastaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('numericFile').files[0];
        const seqName = document.getElementById('seqName').value;
        
        try {
            const content = await readFile(file);
            
            const response = await fetch('/api/convert/to-fasta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    sequenceName: seqName
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                displayResult(numToFastaResult, 
                    `Séquence FASTA (${data.generatedFile}):\n\n${data.data}`);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            displayResult(numToFastaResult, error.message, true);
        }
    });

    // Gestion de la conversion FASTA vers numérique
    const fastaToNumForm = document.getElementById('fastaToNumForm');
    const fastaToNumResult = document.getElementById('fastaToNumResult');

    fastaToNumForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('fastaFile').files[0];
        
        try {
            const content = await readFile(file);
            
            const response = await fetch('/api/convert/to-numeric', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                displayResult(fastaToNumResult, 
                    `Séquence numérique (${data.generatedFile}):\n\n${data.data}`);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            displayResult(fastaToNumResult, error.message, true);
        }
    });

    // Gestion de la navigation fluide
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            section.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}); 