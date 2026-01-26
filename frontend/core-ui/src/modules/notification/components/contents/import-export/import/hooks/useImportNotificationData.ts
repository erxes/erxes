import { REACT_APP_API_URL } from 'erxes-ui';

type ImportMetadata = {
  importId?: string;
  fileName?: string;
  status?: string;
  processedRows?: number;
  successRows?: number;
  errorRows?: number;
  totalRows?: number;
  errorMessage?: string;
  errorFileUrl?: string;
};

export const useImportNotificationData = (metadata?: unknown) => {
  const importMetadata = (metadata || {}) as ImportMetadata;
  const {
    fileName = 'Import',
    status,
    processedRows = 0,
    successRows = 0,
    errorRows = 0,
    totalRows = 0,
    errorMessage,
    errorFileUrl,
  } = importMetadata;

  const errorFileDownloadUrl = errorFileUrl
    ? `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(errorFileUrl)}`
    : undefined;

  const canDownloadErrorFile =
    status === 'completed' && !!errorFileUrl && errorRows > 0;

  return {
    fileName,
    status,
    errorMessage,
    successRows,
    errorRows,
    totalRows: Math.max(totalRows, processedRows),
    errorFileDownloadUrl,
    canDownloadErrorFile,
  };
};
