import type { ReactNode } from 'react';
import type { TNotification } from 'ui-modules';

export type TImportExportNotificationViewProps = {
  createdAt?: string;
  message?: string;
  fileName?: string;
  status?: string;
  errorMessage?: string;
  successRows: number;
  errorRows: number;
  totalRows?: number;
  successLabelKey: string;
  errorFallbackKey: string;
  canDownload?: boolean;
  downloadUrl?: string;
  downloadLabelKey: string;
};

export type StructureDetailItem = {
  label: string;
  value?: ReactNode;
};

export type StructureNotificationDetailProps = Pick<
  TNotification,
  'action' | 'createdAt' | 'fromUser'
> & {
  contentType: string;
  details: StructureDetailItem[];
  error?: { message: string };
  loading: boolean;
  name?: string;
  openLabel: string;
  openPath: string;
};

export type UnknownSystemNotificationContentProps = {
  contentType?: string;
};
