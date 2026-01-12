import { Progress } from 'radix-ui';
import {
  IconX,
  IconDownload,
  IconLoader,
  IconCheck,
  IconRefresh,
} from '@tabler/icons-react';
import { RelativeDateDisplay } from 'erxes-ui/modules/display';
import {
  useExportProgress,
  formatTime,
} from '../../hooks/export/useExportProgress';
import { useExportStatus } from '../../hooks/export/useExportStatus';
import { TExportProgress } from '../../types/export/exportTypes';
import { Badge } from 'erxes-ui/components/badge';
import { Button } from 'erxes-ui';

interface ExportFailedNoticeProps {
  exportItem: TExportProgress;
  canRetry: boolean;
  onRetry?: (exportId: string) => void;
}

function ExportFailedNotice({
  exportItem,
  canRetry,
  onRetry,
}: ExportFailedNoticeProps) {
  return (
    <div className="mt-2">
      <div className="flex items-start gap-2">
        <IconX className="size-4 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">Export Failed</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {exportItem.errorMessage || 'An error occurred during export'}
          </p>
          {canRetry && onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRetry(exportItem._id)}
            >
              <IconRefresh className="size-4 text-primary" />
              Retry from last position
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExportProgress({
  exportItem,
  onRetry,
}: {
  exportItem: TExportProgress;
  onRetry?: (exportId: string) => void;
}) {
  const progress = useExportProgress(exportItem);
  const {
    isProcessing,
    isFailed,
    isCompleted,
    handleDownload,
    canDownload,
    fileName = '',
    dateValue,
  } = useExportStatus(exportItem);

  if (!progress) return null;
  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <StatusIcon
        status={isProcessing ? 'processing' : isFailed ? 'failed' : 'completed'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {dateValue && (
                <RelativeDateDisplay.Value value={dateValue} isShort />
              )}
              {exportItem.totalRows > 0 && (
                <>
                  <span>•</span>
                  <span>{exportItem.totalRows.toLocaleString()} records</span>
                </>
              )}
            </div>
          </div>
          <StatusBadge
            status={
              isProcessing ? 'processing' : isFailed ? 'failed' : 'completed'
            }
          />
        </div>

        {isProcessing && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Processing</span>
              <span>{progress.percentage}%</span>
            </div>
            <Progress.Root value={progress.percentage} className="h-1.5">
              <Progress.Indicator className="bg-info" />
            </Progress.Root>
            <div className="text-xs text-muted-foreground mt-1">
              {formatTime(progress.estimatedMinutesRemaining)} remaining
            </div>
          </div>
        )}

        {isFailed && (
          <ExportFailedNotice
            exportItem={exportItem}
            canRetry={progress.canRetry}
            onRetry={onRetry}
          />
        )}

        {isCompleted && (
          <div className="mt-2">
            <p className="text-xs text-success">
              Export completed successfully
            </p>
          </div>
        )}
      </div>
      {canDownload && (
        <Button variant="secondary" size="sm" onClick={handleDownload}>
          <IconDownload className="size-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}

const StatusIcon = ({
  status,
}: {
  status: 'processing' | 'completed' | 'failed';
}) => {
  switch (status) {
    case 'processing':
      return (
        <div className="flex items-center justify-center size-8 rounded-full bg-success/10">
          <IconLoader className="size-4 text-info animate-spin" />
        </div>
      );
    case 'completed':
      return (
        <div className="flex items-center justify-center size-8 rounded-full bg-success/10">
          <IconCheck className="size-4 text-success" />
        </div>
      );
    case 'failed':
      return (
        <div className="flex items-center justify-center size-8 rounded-full bg-destructive/10">
          <IconX className="size-4 text-destructive" />
        </div>
      );
  }
};

const StatusBadge = ({
  status,
}: {
  status: 'processing' | 'completed' | 'failed';
}) => {
  switch (status) {
    case 'processing':
      return <Badge variant="info">PROCESSING</Badge>;
    case 'completed':
      return <Badge variant="success">COMPLETED</Badge>;
    case 'failed':
      return <Badge variant="destructive">FAILED</Badge>;
  }
};
