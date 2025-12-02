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
    if (!exportItem?.fileKeys?.length) return;

    exportItem.fileKeys.forEach((fileKey: string, index: number) => {
      const downloadName =
        exportItem.fileName ||
        `export-${exportItem._id}${index > 0 ? `-${index + 1}` : ''}.${
          exportItem.fileFormat || 'csv'
        }`;
      const fileUrl = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
        fileKey,
      )}`;

      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }, [exportItem]);

  return useMemo(() => {
    const isProcessing =
      exportItem?.status === 'processing' ||
      exportItem?.status === 'validating' ||
      exportItem?.status === 'pending';
    const isFailed = exportItem?.status === 'failed';
    const isCompleted = exportItem?.status === 'completed';

    const canDownload =
      isCompleted && !!exportItem.fileKeys && exportItem.fileKeys.length > 0;

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
