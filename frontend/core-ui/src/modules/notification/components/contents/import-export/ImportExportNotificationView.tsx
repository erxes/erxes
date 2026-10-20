import type { TImportExportNotificationViewProps } from '@/notification/types/notificationContent';
import { IconDownload, IconLoader, IconUpload } from '@tabler/icons-react';
import { Badge, Button, cn, RelativeDateDisplay } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ImportExportNotificationView = ({
  createdAt,
  message,
  fileName,
  status,
  errorMessage,
  successRows,
  errorRows,
  totalRows,
  successLabelKey,
  errorFallbackKey,
  canDownload,
  downloadUrl,
  downloadLabelKey,
}: TImportExportNotificationViewProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  const statusView = buildStatus(status);

  return (
    <div className="flex flex-col gap-3 min-h-full justify-center w-full max-w-md mx-auto items-center p-6 text-muted-foreground">
      <div className="size-28 bg-sidebar rounded-2xl border-2 border-dashed flex items-center justify-center">
        {statusView.icon}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="max-w-full break-words text-center text-sm text-foreground">
          {fileName}
        </span>
        <Badge className={cn('text-xs font-medium', statusView.badgeClass)}>
          {t(statusView.labelKey)}
        </Badge>
        {createdAt && (
          <span className="text-xs">
            <RelativeDateDisplay.Value value={createdAt} />
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-foreground font-semibold">
            {totalRows?.toLocaleString?.() || '—'}
          </span>
          <span>{t('rows')}</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1 text-success">
          <span className="text-success font-semibold">
            {successRows.toLocaleString()}
          </span>
          <span>{t(successLabelKey)}</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1 text-destructive">
          <span className="text-destructive font-semibold">
            {errorRows.toLocaleString()}
          </span>
          <span>{t('errors')}</span>
        </div>
      </div>

      {status === 'failed' && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive inline-flex text-left">
          {errorMessage || t(errorFallbackKey)}
        </div>
      )}

      {canDownload && (
        <Button asChild variant="default" size="lg" className="gap-2">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <IconDownload className="size-4" />
            {t(downloadLabelKey)}
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
    labelKey: 'status-completed',
    icon: <IconUpload size={64} className="text-accent-foreground" />,
    badgeClass: 'bg-success/10 text-success',
  },
  failed: {
    labelKey: 'status-failed',
    icon: <IconUpload size={64} className="text-accent-foreground" />,
    badgeClass: 'bg-destructive/10 text-destructive',
  },
} as const;

const buildStatus = (status?: string) =>
  statusMap[status as keyof typeof statusMap] ?? {
    // In-progress notifications should not reach here, but keep a safe fallback
    labelKey: 'status-processing',
    icon: <IconLoader className="size-4 text-info animate-spin" />,
    badgeClass: 'bg-info/10 text-info',
  };
