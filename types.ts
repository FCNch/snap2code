export enum AppStatus {
  IDLE = 'IDLE',
  PREVIEWING = 'PREVIEWING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ConversionResult {
  html: string;
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
  html: string;
  previewBase64: string; // Store a small preview or the full image
  mimeType: string;
}