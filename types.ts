export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SYNTHESIZING = 'SYNTHESIZING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface FileData {
  name: string;
  type: string;
  base64: string;
}

export interface ProcessingStatus {
  state: AppState;
  message: string;
}
