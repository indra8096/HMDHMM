document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dnaConversionForm');
    const resultDiv = document.getElementById('conversionResult');

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
    const displayResult = (data, error = false) => {
        resultDiv.textContent = error ? `Erreur: ${data}` : data;
        resultDiv.classList.add('show');
        if (error) {
            resultDiv.classList.add('error');
        } else {
            resultDiv.classList.remove('error');
        }
    };

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sequenceName = document.getElementById('sequenceName').value;
        const file = document.getElementById('sequenceFile').files[0];
        
        try {
            const content = await readFile(file);
            
            const response = await fetch('/api/dna/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    sequenceName
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                displayResult(data.data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            displayResult(error.message, true);
        }
    });
}); 