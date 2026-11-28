import type { Export, Import } from '@erxes/core-contract';
import { IconDownload } from '@tabler/icons-react';
import { Badge, RelativeDateDisplay, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fileDownloadUrl } from '~/lib/files';
import { paths } from '~/lib/paths';
import { useTransferLabel } from './useTransfer';

const IMPORT_TONE: Record<
  Import['status'],
  'success' | 'warning' | 'destructive' | 'secondary' | 'info'
> = {
  parsing: 'info',
  mapping: 'warning',
  checking: 'info',
  checked: 'warning',
  running: 'info',
  done: 'success',
  failed: 'destructive',
  undone: 'secondary',
};

const EXPORT_TONE: Record<Export['status'], 'success' | 'destructive' | 'info'> = {
  running: 'info',
  done: 'success',
  failed: 'destructive',
};

const When = ({ value }: { value: string }) => (
  <span className="text-xs text-muted-foreground">
    <RelativeDateDisplay value={value} render={<span />}>
      <RelativeDateDisplay.Value value={value} />
    </RelativeDateDisplay>
  </span>
);

/** An import in a list: its status, file and counts; it opens the import. */
export const ImportRow = ({ item }: { item: Import }) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export' });
  const fmt = useFormat();
  const labelOf = useTransferLabel();

  return (
    <li>
      <Link
        to={paths.contacts.importOrExport(item.id)}
        className="flex items-center gap-3 p-3 hover:bg-muted/50"
      >
        <Badge variant={IMPORT_TONE[item.status]}>{t(`status.${item.status}`, item.status)}</Badge>
        <span className="min-w-0 flex-1 truncate font-medium">{item.fileName}</span>
        <span className="text-xs text-muted-foreground">
          {labelOf(item.recordType)} · {fmt.number(item.counts.rows)} {t('rows', 'rows')}
          {item.status === 'done' &&
            ` · ${item.counts.create} ${t('count-created', 'created')}, ${item.counts.update} ${t('count-updated', 'updated')}`}
        </span>
        <When value={item.createdAt} />
      </Link>
    </li>
  );
};

/** An export in a list: its status, format and rows, and its file to download once done. */
export const ExportRow = ({ item }: { item: Export }) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export' });
  const fmt = useFormat();
  const labelOf = useTransferLabel();

  return (
    <li className="flex items-center gap-3 p-3">
      <Badge variant={EXPORT_TONE[item.status]}>
        {t(`export-status.${item.status}`, item.status)}
      </Badge>
      <span className="min-w-0 flex-1 truncate">
        {labelOf(item.recordType)} · {item.format.toUpperCase()}
        {item.rowCount !== null && ` · ${fmt.number(item.rowCount)} ${t('rows', 'rows')}`}
        {item.error && <span className="text-destructive-text"> · {item.error}</span>}
      </span>
      <When value={item.createdAt} />
      {item.fileId && (
        <a
          href={fileDownloadUrl(item.fileId)}
          className="flex items-center gap-1 text-primary-text hover:underline"
        >
          <IconDownload className="size-4" />
          {t('download', 'Download')}
        </a>
      )}
    </li>
  );
};
