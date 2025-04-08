export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  connections: string[];
  type: 'analyzer' | 'generator' | 'processor' | 'validator';
  status: 'active' | 'inactive' | 'processing';
  config?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
  };
} 