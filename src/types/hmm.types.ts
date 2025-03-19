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