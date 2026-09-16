import { Progress } from 'radix-ui';
import { Button, REACT_APP_API_URL } from 'erxes-ui';
import {
  IconX,
  IconRefresh,
  IconPlayerPlay,
  IconDownload,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useImportProgress } from '../../hooks/import/useImportProgress';
import { TImportProgress } from '../../types/import/importTypes';

export function ImportProgress({
  importProgress,
}: {
  importProgress: TImportProgress;
}) {
  const { t } = useTranslation('importExport');
  const {
    timeRemaining,
    statusObject,
    handleCancel,
    handleRetry,
    handleResume,
    canCancel,
    canRetry,
    canResume,
  } = useImportProgress(importProgress);

  const { label, Icon: IconComponent } = statusObject || {};

  const successRows = importProgress.successRows || 0;
  const errorRows = importProgress.errorRows || 0;
  const totalProcessed = successRows + errorRows;
  const successRatio =
    totalProcessed > 0 ? (successRows / totalProcessed) * 100 : 0;
  const errorRatio =
    totalProcessed > 0 ? (errorRows / totalProcessed) * 100 : 0;

  const handleDownloadErrorFile = () => {
    if (!importProgress.errorFileUrl) return;

    const fileUrl = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
      importProgress.errorFileUrl,
    )}`;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `import-errors-${importProgress._id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-2 p-3 border rounded-lg bg-background">
      <div className="flex items-center justify-between gap-2 text-sm">
        {/* min-w-0 lets the flex child shrink so `truncate` can actually bite */}
        <span className="min-w-0 flex-1 truncate font-medium">
          {importProgress.fileName}
        </span>
        <span className="shrink-0 text-muted-foreground text-xs">
          {IconComponent && statusObject && (
            <div className="flex flex-row items-center gap-1">
              <IconComponent className="size-3" />
              {label}
            </div>
          )}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t('rows-progress', {
              processed: importProgress.processedRows.toLocaleString(),
              total: importProgress.totalRows.toLocaleString(),
            })}
          </span>
          {importProgress.status === 'processing' && (
            <span>{t('time-remaining', { time: timeRemaining })}</span>
          )}
        </div>
        <Progress.Root value={importProgress.progress} className="h-2">
          <Progress.Indicator />
        </Progress.Root>
      </div>
      {totalProcessed > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('success-rate')}</span>
            <span className="font-medium">
              {t('success-errors', {
                success: successRows.toLocaleString(),
                errors: errorRows.toLocaleString(),
              })}
            </span>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
            <div
              className="bg-green-500 h-full transition-all"
              style={{ width: `${successRatio}%` }}
            />
            <div
              className="bg-red-500 h-full transition-all"
              style={{ width: `${errorRatio}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        {importProgress.errorFileUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadErrorFile}
            className="flex-1"
          >
            <IconDownload className="size-3" />
            {t('download-errors')}
          </Button>
        )}
        {(canCancel || canRetry || canResume) && (
          <>
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex-1"
              >
                <IconX className="size-3" />
                {t('cancel')}
              </Button>
            )}
            {canResume && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResume}
                className="flex-1"
              >
                <IconPlayerPlay className="size-3" />
                {t('resume')}
              </Button>
            )}
            {canRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="flex-1"
              >
                <IconRefresh className="size-3" />
                {t('restart')}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
