// shared type definitions used across the app

export type Language =
  | 'english'
  | 'igbo'
  | 'yoruba'
  | 'hausa';

export type ChurchEventType =
  | 'general'
  | 'christmas'
  | 'easter'
  | 'lent'
  | 'advent'
  | 'pentecost';

export type VoicePart = 'soprano' | 'alto' | 'tenor' | 'bass';

export type ArrangementStatus =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'failed';

export type ExportFormat = 'musicxml' | 'midi' | 'pdf';

export type MobileMoneyProvider = 'mtn' | 'airtel';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface SATBVoiceLine {
  part: VoicePart;
  notation: string;
}

export interface SATBArrangement {
  id: string;
  hymnId: string;
  language: Language;
  theme: string;
  status: ArrangementStatus;
  keySignature: string;
  tempoBpm: number;
  timeSignature: string;
  voices: SATBVoiceLine[];
  // optional ABC text representation when generated via ABC notation
  abcNotation?: string;
  musicXml: string;
  midiUrl: string | null;
  pdfUrl: string | null;
  audioPreviewUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoyaltySplit {
  walletAddress: string;
  label: string;
  percentageBps: number;
}
