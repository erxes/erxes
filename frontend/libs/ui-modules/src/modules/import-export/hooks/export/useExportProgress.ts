import { useMemo } from 'react';
import {
  TExportProgressInfo,
  TExportProgress,
} from '../../types/export/exportTypes';

export function useExportProgress(
  exportItem: TExportProgress | undefined,
): TExportProgressInfo | null {
  return useMemo(() => {
    if (!exportItem) return null;

    const percentage =
      exportItem.totalRows > 0
        ? Math.round((exportItem.processedRows / exportItem.totalRows) * 100)
        : 0;

    const remainingRows = Math.max(
      0,
      exportItem.totalRows - exportItem.processedRows,
    );

    const elapsedMinutes = exportItem.elapsedSeconds
      ? Math.round(exportItem.elapsedSeconds / 60)
      : 0;

    const estimatedMinutesRemaining = exportItem.estimatedSecondsRemaining
      ? Math.round(exportItem.estimatedSecondsRemaining / 60)
      : 0;

    const canRetry = exportItem.status === 'failed' && !!exportItem.lastCursor;

    return {
      percentage,
      processedRows: exportItem.processedRows,
      totalRows: exportItem.totalRows,
      remainingRows,
      elapsedMinutes,
      estimatedMinutesRemaining,
      rowsPerSecond: exportItem.rowsPerSecond || 0,
      status: exportItem.status,
      canRetry,
    };
  }, [exportItem]);
}

export function formatTime(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}
