export enum AppStatus {
  IDLE = 'IDLE',
  PREVIEWING = 'PREVIEWING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type OutputFormat = 'html_tailwind' | 'html_bootstrap' | 'react_tailwind' | 'json' | 'sql';

export interface ConversionResult {
  code: string;
  format: OutputFormat;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string; // Pure base64 without prefix for API
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageName: string;
  code: string; 
  format: OutputFormat;
  previewBase64: string; // Store a small preview or the full image
  mimeType: string;
}
