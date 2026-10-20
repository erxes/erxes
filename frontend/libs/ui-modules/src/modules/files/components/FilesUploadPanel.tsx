import {
  IconCheck,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { Button, formatBytes } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFilesUpload } from '../hooks/useFilesUpload';
import { IFileUploadItem } from '../types';

const percent = (item: IFileUploadItem) =>
  item.size
    ? Math.min(100, Math.round((item.uploadedBytes / item.size) * 100))
    : 0;

const UploadRow = ({ item }: { item: IFileUploadItem }) => {
  const { t } = useTranslation('files');
  const { pause, resume, cancel } = useFilesUpload();
  const isActive = item.status === 'uploading' || item.status === 'queued';

  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="truncate flex-1" title={item.name}>
          {item.name}
        </span>
        {item.status === 'done' && (
          <IconCheck className="size-4 text-success" />
        )}
        {isActive && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('pause')}
            onClick={() => pause(item.localId)}
          >
            <IconPlayerPause />
          </Button>
        )}
        {item.status === 'paused' && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('resume')}
            onClick={() => resume(item.localId)}
          >
            <IconPlayerPlay />
          </Button>
        )}
        {item.status === 'failed' && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('retry')}
            onClick={() => resume(item.localId)}
          >
            <IconRefresh />
          </Button>
        )}
        {item.status !== 'done' && item.status !== 'completing' && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('cancel')}
            onClick={() => cancel(item.localId)}
          >
            <IconX />
          </Button>
        )}
      </div>
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={
            item.status === 'failed'
              ? 'h-full bg-destructive'
              : 'h-full bg-primary'
          }
          style={{ width: `${percent(item)}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {item.status === 'failed'
          ? item.error
          : `${formatBytes(item.uploadedBytes, 1)} / ${formatBytes(
              item.size,
              1,
            )} · ${t(`status-${item.status}`)}`}
      </div>
    </div>
  );
};

export const FilesUploadPanel = () => {
  const { t } = useTranslation('files');
  const { uploads, clearFinished } = useFilesUpload();

  if (!uploads.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border bg-background shadow-lg">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">{t('uploads')}</span>
        <Button variant="ghost" size="sm" onClick={clearFinished}>
          {t('clear-finished')}
        </Button>
      </div>
      <div className="max-h-72 overflow-y-auto px-3 divide-y">
        {uploads.map((item) => (
          <UploadRow key={item.localId} item={item} />
        ))}
      </div>
    </div>
  );
};
