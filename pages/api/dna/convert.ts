import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import { join } from 'path';

// Fonction pour convertir une séquence ADN en format numérique
function convertDnaSequence(sequence: string): number[] {
  // Nettoie la séquence en supprimant les caractères non-ADN
  const cleanedSequence = sequence.toUpperCase().replace(/[^ACGT]/g, '');
  
  // Converti chaque nucléotide en valeur numérique
  return Array.from(cleanedSequence).map(nucleotide => {
    switch (nucleotide) {
      case 'A': return 0;
      case 'C': return 1;
      case 'G': return 2;
      case 'T': return 3;
      default: return -1; // Ne devrait jamais arriver après le nettoyage
    }
  });
}

// Fonction pour formater la sortie
function formatOutput(name: string, sequence: string, numericValues: number[]): string {
  const nucleotideMap = { 'A': 0, 'C': 1, 'G': 2, 'T': 3 };
  
  let output = '';
  
  // En-tête avec le nom de la séquence ou un nom par défaut
  output += `# Séquence: ${name || 'Séquence ADN'}\n`;
  output += '# Format pour UMDHMM\n';
  output += '\n';
  
  // Nombre de symboles observables (4 pour l'ADN: A, C, G, T)
  output += '4\n';
  
  // Nombre d'observations (longueur de la séquence)
  output += `${numericValues.length}\n`;
  
  // Valeurs numériques
  output += numericValues.join(' ') + '\n';
  
  return output;
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { sequence, name } = req.body;

    if (!sequence) {
      return res.status(400).json({ error: 'Aucune séquence fournie' });
    }

    // Convertir la séquence
    const numericValues = convertDnaSequence(sequence);
    
    // Formater la sortie
    const output = formatOutput(name || '', sequence, numericValues);

    // Retourner le résultat
    return res.status(200).json({ 
      output,
      numericValues 
    });

  } catch (error) {
    console.error('Erreur lors de la conversion de la séquence:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la conversion de la séquence',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
} 