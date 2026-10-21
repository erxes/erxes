import { formatBytes } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFilesUsage } from '../hooks/useFilesUsage';

export const FilesUsageMeter = () => {
  const { t } = useTranslation('files');
  const { usage, percent } = useFilesUsage();

  if (!usage) {
    return null;
  }

  return (
    <div className="flex min-w-40 flex-col gap-1 text-xs text-muted-foreground">
      <span>
        {usage.quotaBytes
          ? t('usage-of', {
              used: formatBytes(usage.usedBytes, 1),
              quota: formatBytes(usage.quotaBytes, 1),
            })
          : t('usage-used', { used: formatBytes(usage.usedBytes, 1) })}
      </span>
      {percent !== null && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={
              percent >= 90 ? 'h-full bg-destructive' : 'h-full bg-primary'
            }
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};
