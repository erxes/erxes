type TImportProgressStatus =
  | 'pending'
  | 'validating'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TImportProgress = {
  _id: string;
  entityType: string;
  fileName: string;
  fileKey?: string;
  status: TImportProgressStatus;

  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  errorFileUrl?: string;
  progress: number;
  elapsedSeconds: number;
  rowsPerSecond: number;
  estimatedSecondsRemaining: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
};

export type TImportColumnMatchStatus = 'matched' | 'suggested' | 'unmatched';

export type TImportPreviewColumn = {
  index: number;
  header: string;
  key?: string | null;
  confidence: number;
  status: TImportColumnMatchStatus;
  sampleValues: string[];
};

export type TImportPreviewField = {
  key: string;
  label: string;
  type: 'system' | 'customProperty';
  dataType: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiSelect';
  options: string[];
  example: string;
  required: boolean;
};

export type TImportColumnPreview = {
  columns: TImportPreviewColumn[];
  fields: TImportPreviewField[];
  totalRows: number;
};

export type TImportColumnMapping = {
  index: number;
  header: string;
  key: string;
};

export type TPendingImportUpload = {
  fileKey: string;
  fileName: string;
};
