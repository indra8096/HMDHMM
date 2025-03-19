export interface HMMModel {
  states: number;
  symbols: number;
  initialProb: number[];
  transitionProb: number[][];
  emissionProb: number[][];
}

export interface TestForRequest {
  hmmFile: string;
  seqFile: string;
  hmmContent: string;
  seqContent: string;
}

export interface GenSeqRequest {
  hmmFile: string;
  length: number;
  seed?: number;
  hmmContent: string;
}

export interface TestVitRequest {
  hmmFile: string;
  seqFile: string;
  hmmContent: string;
  seqContent: string;
}

export interface EstHMMRequest {
  seqFile: string;
  seqContent: string;
  N: number;  // Nombre d'états
  M: number;  // Taille de l'alphabet
}

export interface ConvertRequest {
  content: string;
  sequenceName?: string;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  generatedFile?: string;
}

export interface HMMDefinition {
    N: number;  // Nombre d'états cachés
    M: number;  // Nombre de symboles observables
    A: number[][]; // Matrice de transition
    B: number[][]; // Matrice d'émission
    pi: number[]; // Distribution initiale
}

export interface HMMProblem {
    title: string;
    description: string;
    algorithm: string;
    complexity: string;
    details: string[];
}

export interface HMMApplication {
    title: string;
    description: string;
}

export interface HMMFormProps {
    id: string;
    title: string;
    onSubmit: (data: FormData) => Promise<void>;
}

export interface FormData {
    hmmFile?: File;
    seqFile?: File;
    length?: number;
    seed?: number;
    N?: number;
    M?: number;
} 