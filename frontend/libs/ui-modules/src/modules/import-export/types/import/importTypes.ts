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
