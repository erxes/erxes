import { INotification } from '@/notification/my-inbox/types/notifications';
import { IconDownload, IconLoader, IconUpload } from '@tabler/icons-react';
import { Badge, Button, cn, RelativeDateDisplay } from 'erxes-ui';
import { useImportNotificationData } from '../hooks/useImportNotificationData';

export const ImportNotificationContent = ({
  createdAt,
  metadata,
  message,
}: INotification) => {
  const {
    fileName,
    status,
    errorMessage,
    successRows,
    errorRows,
    totalRows,
    errorFileDownloadUrl,
    canDownloadErrorFile,
  } = useImportNotificationData(metadata);

  const statusView = buildStatus(status);

  return (
    <div className="flex flex-col gap-3 h-screen justify-center w-full max-w-md mx-auto items-center text-muted-foreground">
      <div className="size-28 bg-sidebar rounded-2xl border-2 border-dashed flex items-center justify-center">
        {statusView.icon}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm text-foreground truncate">{fileName}</span>
        <Badge className={cn('text-xs font-medium', statusView.badgeClass)}>
          {statusView.label}
        </Badge>
        {createdAt && (
          <span className="text-xs">
            <RelativeDateDisplay.Value value={createdAt} />
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-foreground font-semibold">
            {totalRows?.toLocaleString?.() || '—'}
          </span>
          <span>Rows</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1 text-success">
          <span className="text-success font-semibold">
            {successRows.toLocaleString()}
          </span>
          <span>Imported</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1 text-destructive">
          <span className="text-destructive font-semibold">
            {errorRows.toLocaleString()}
          </span>
          <span>Errors</span>
        </div>
      </div>

      {status === 'failed' && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive inline-flex text-left">
          {errorMessage || 'An error occurred during import.'}
        </div>
      )}

      {canDownloadErrorFile && (
        <Button asChild variant="default" size="lg" className="gap-2">
          <a
            href={errorFileDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconDownload className="size-4" />
            Download Error File
          </a>
        </Button>
      )}

      <p className="text-sm text-muted-foreground line-clamp-2 text-center">
        {message}
      </p>
    </div>
  );
};

const statusMap = {
  completed: {
    label: 'Completed',
    icon: <IconUpload size={64} className="text-accent-foreground" />,
    badgeClass: 'bg-success/10 text-success',
  },
  failed: {
    label: 'Failed',
    icon: <IconUpload size={64} className="text-accent-foreground" />,
    badgeClass: 'bg-destructive/10 text-destructive',
  },
} as const;

const buildStatus = (status?: string) =>
  statusMap[status as keyof typeof statusMap] ?? {
    // In-progress notifications should not reach here, but keep a safe fallback
    label: 'Processing',
    icon: <IconLoader className="size-4 text-info animate-spin" />,
    badgeClass: 'bg-info/10 text-info',
  };
