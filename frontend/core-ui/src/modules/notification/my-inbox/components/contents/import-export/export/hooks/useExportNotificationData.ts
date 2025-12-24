import { REACT_APP_API_URL } from 'erxes-ui';

type ExportMetadata = {
  exportId?: string;
  fileName?: string;
  status?: string;
  processedRows?: number;
  totalRows?: number;
  errorMessage?: string;
  fileKey?: string;
};

export const useExportNotificationData = (metadata?: unknown) => {
  const exportMetadata = (metadata || {}) as ExportMetadata;
  const {
    fileName = 'Export',
    status,
    processedRows = 0,
    totalRows = 0,
    errorMessage,
    fileKey,
  } = exportMetadata;

  const fileUrl = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
    fileKey || '',
  )}`;

  const canDownload = status === 'completed' && !!fileKey;

  const total = Math.max(totalRows, processedRows);
  const successRows = Math.min(processedRows, totalRows || processedRows);
  const errorRows = Math.max(total - successRows, 0);

  return {
    fileName,
    status,
    errorMessage,
    successRows,
    errorRows,
    totalRows,
    fileUrl,
    canDownload,
  };
};
