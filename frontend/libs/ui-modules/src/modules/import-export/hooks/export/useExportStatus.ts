import { useMemo, useCallback } from 'react';
import { REACT_APP_API_URL } from 'erxes-ui';
import {
  TExportProgress,
  TUseExportStatusReturn,
} from '../../types/export/exportTypes';

export function useExportStatus(
  exportItem: TExportProgress | undefined,
): TUseExportStatusReturn {
  const handleDownload = useCallback(() => {
    if (!exportItem?.fileKey) return;

    const downloadName =
      exportItem.fileName ||
      `export-${exportItem._id}.${exportItem.fileFormat || 'csv'}`;
    const fileUrl = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
      exportItem.fileKey,
    )}`;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [exportItem]);

  return useMemo(() => {
    const isProcessing =
      exportItem?.status === 'processing' ||
      exportItem?.status === 'validating' ||
      exportItem?.status === 'pending';
    const isFailed = exportItem?.status === 'failed';
    const isCompleted = exportItem?.status === 'completed';

    const canDownload = isCompleted && !!exportItem?.fileKey;

    const fileName = exportItem?.fileName || 'Export';
    const dateValue =
      exportItem?.completedAt || exportItem?.startedAt || exportItem?.createdAt;

    return {
      isProcessing,
      isFailed,
      isCompleted,
      handleDownload,
      canDownload,
      fileName,
      dateValue,
    };
  }, [exportItem, handleDownload]);
}
