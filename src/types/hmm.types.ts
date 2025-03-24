/**
 * Types utilisés dans l'application UMDHMM
 */

/**
 * Format de requête pour la conversion d'ADN
 */
export interface ConvertRequest {
  content: string;
  sequenceName?: string;
  outputType?: string;
}

/**
 * Format de réponse standard de l'API
 */
export interface APIResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
} 