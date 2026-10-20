import { IconDownload, IconRestore } from '@tabler/icons-react';
import { Badge, Button, formatBytes, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IFilesVersion } from 'ui-modules';

type TFilesVersionsListProps = {
  versions: IFilesVersion[];
  currentVersionId?: string;
  loading: boolean;
  restoring: boolean;
  canRestore: boolean;
  onDownload: (versionId: string) => void;
  onRestore: (versionId: string) => void;
};

export const FilesVersionsList = ({
  versions,
  currentVersionId,
  loading,
  restoring,
  canRestore,
  onDownload,
  onRestore,
}: TFilesVersionsListProps) => {
  const { t } = useTranslation('files');

  if (loading && !versions.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y">
      {versions.map((version) => (
        <div
          key={version._id}
          className="flex items-center gap-3 px-4 py-3 text-sm"
        >
          <span className="font-medium">v{version.version}</span>
          {version._id === currentVersionId && (
            <Badge variant="secondary">{t('current')}</Badge>
          )}
          <span className="flex-1 text-muted-foreground">
            {version.createdAt
              ? new Date(version.createdAt).toLocaleString()
              : ''}{' '}
            · {formatBytes(version.size, 1)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('download')}
            onClick={() => onDownload(version._id)}
          >
            <IconDownload />
          </Button>
          {canRestore && version._id !== currentVersionId && (
            <Button
              variant="ghost"
              size="sm"
              disabled={restoring}
              onClick={() => onRestore(version._id)}
            >
              <IconRestore />
              {t('make-current')}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
