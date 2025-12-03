export interface ProcessedDocument {
  originalFileName: string;
  script: string;
  audioBuffer?: AudioBuffer;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SYNTHESIZING = 'SYNTHESIZING',
  READY = 'READY',
  ERROR = 'ERROR',
}

export interface ProcessingError {
  message: string;
  details?: string;
}
