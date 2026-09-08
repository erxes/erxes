import { ReactNode } from 'react';
import { PropertyFilterOperator } from '../../../properties/types/fieldsTypes';

type TExportProgressStatus =
  | 'pending'
  | 'validating'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TExportProgress = {
  _id: string;
  entityType: string;
  fileName: string;
  status: TExportProgressStatus;
  totalRows: number;
  processedRows: number;
  fileFormat: 'csv' | 'xlsx';
  fileKey?: string;
  filters?: Record<string, any>;
  ids?: string[];
  progress?: number;
  elapsedSeconds?: number;
  rowsPerSecond?: number;
  estimatedSecondsRemaining?: number;
  errorMessage?: string;
  lastCursor?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
};

export type TSystemFieldCondition = {
  key: string;
  operator: PropertyFilterOperator;
  value?: unknown;
};

export type TRenderRelationValueInput = (params: {
  header: TExportHeader;
  condition: TSystemFieldCondition;
  allConditions: TSystemFieldCondition[];
  onChange: (value: unknown) => void;
}) => ReactNode;

export type TExportFieldSelectionProps = {
  entityType: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    selectedFields: string[],
    systemFieldConditions?: TSystemFieldCondition[],
  ) => void;
  recordCount?: number;
  entityDisplayName?: string;
  filters?: Record<string, any>;
  renderRelationValueInput?: TRenderRelationValueInput;
};

export type TSearchAndActionsProps = {
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectDefaults: () => void;
  selectedCount: number;
  totalCount: number;
};

export type TExportHeader = {
  label: string;
  key: string;
  isDefault?: boolean;
  type?: 'system' | 'customProperty';
  fieldType?: 'text' | 'number' | 'date' | 'relation' | 'select';
  relationKind?: string;
  options?: { label: string; value: string }[];
};

export type TExportProgressInfo = {
  percentage: number;
  processedRows: number;
  totalRows: number;
  remainingRows: number;
  elapsedMinutes: number;
  estimatedMinutesRemaining: number;
  rowsPerSecond: number;
  status: TExportProgress['status'];
  canRetry: boolean;
};

export type TUseExportStatusReturn = {
  isProcessing: boolean;
  isFailed: boolean;
  isCompleted: boolean;
  handleDownload: () => void;
  canDownload: boolean;
  fileName?: string;
  dateValue?: string;
};
