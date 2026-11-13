import type { Export, Import } from '@erxes/core-contract';
import { IconDownload, IconFileExport, IconFileImport } from '@tabler/icons-react';
import {
  Badge,
  Empty,
  PageContainer,
  PageHeader,
  RelativeDateDisplay,
  ScrollArea,
  Tabs,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { useCan } from '~/modules/auth/session';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';
import { downloadHref, useExports, useImports } from '~/modules/transfer/useTransfer';

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
  <RelativeDateDisplay value={value} asChild>
    <span className="text-xs text-muted-foreground">
      <RelativeDateDisplay.Value value={value} />
    </span>
  </RelativeDateDisplay>
);

const Nothing = ({ icon: Icon, title }: { icon: typeof IconFileImport; title: string }) => (
  <Empty className="py-12">
    <Empty.Header>
      <Empty.Media variant="icon">
        <Icon />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
    </Empty.Header>
  </Empty>
);

const ImportRow = ({ item }: { item: Import }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });

  return (
    <li>
      <Link
        to={`${CONTACT_SETTINGS.importExport}/${item.id}`}
        className="flex items-center gap-3 p-3 hover:bg-muted/50"
      >
        <Badge variant={IMPORT_TONE[item.status]}>{t(`status.${item.status}`, item.status)}</Badge>
        <span className="min-w-0 flex-1 truncate font-medium">{item.fileName}</span>
        <span className="text-xs text-muted-foreground">
          {t(`noun.${item.recordType}`, item.recordType)} · {item.counts.rows.toLocaleString()}{' '}
          {t('rows', 'rows')}
          {item.status === 'done' &&
            ` · ${item.counts.create} ${t('count-created', 'created')}, ${item.counts.update} ${t('count-updated', 'updated')}`}
        </span>
        <When value={item.createdAt} />
      </Link>
    </li>
  );
};

const ExportRow = ({ item }: { item: Export }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });

  return (
    <li className="flex items-center gap-3 p-3">
      <Badge variant={EXPORT_TONE[item.status]}>
        {t(`export-status.${item.status}`, item.status)}
      </Badge>
      <span className="min-w-0 flex-1 truncate">
        {t(`noun.${item.recordType}`, item.recordType)} · {item.format.toUpperCase()}
        {item.rowCount !== null && ` · ${item.rowCount.toLocaleString()} ${t('rows', 'rows')}`}
        {item.error && <span className="text-destructive"> · {item.error}</span>}
      </span>
      <When value={item.createdAt} />
      {item.fileId && (
        <a
          href={downloadHref(item.fileId)}
          className="flex items-center gap-1 text-primary-text hover:underline"
        >
          <IconDownload className="size-4" />
          {t('download', 'Download')}
        </a>
      )}
    </li>
  );
};

const ImportsList = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });

  return (
    <QueryState
      query={useImports()}
      isEmpty={({ data }) => !data.length}
      empty={<Nothing icon={IconFileImport} title={t('no-imports', 'No imports yet')} />}
    >
      {({ data }) => (
        <ul className="divide-y rounded-lg border text-sm">
          {data.map((item) => (
            <ImportRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </QueryState>
  );
};

const ExportsList = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });

  return (
    <QueryState
      query={useExports()}
      isEmpty={({ data }) => !data.length}
      empty={<Nothing icon={IconFileExport} title={t('no-exports', 'No exports yet')} />}
    >
      {({ data }) => (
        <ul className="divide-y rounded-lg border text-sm">
          {data.map((item) => (
            <ExportRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </QueryState>
  );
};

/** Contacts › Settings › Import & export history: past imports (continue, see results, undo) and exports (download). */
export const ImportExportPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const can = useCan();
  const [params, setParams] = useSearchParams();
  const canImport = can('contacts.import');
  const canExport = can('contacts.export');

  if (!canImport && !canExport) return <Navigate to="/settings" replace />;

  const highlighted = params.get('import');

  if (highlighted)
    return <Navigate to={`${CONTACT_SETTINGS.importExport}/${highlighted}`} replace />;

  const tab = params.get('tab') ?? (params.get('export') || !canImport ? 'exports' : 'imports');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Import & export history'),
                to: CONTACT_SETTINGS.importExport,
                icon: IconFileImport,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <Tabs
        value={tab}
        onValueChange={(next) => setParams({ tab: next })}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="border-b px-4">
          <Tabs.List className="h-9 border-b-0">
            {canImport && <Tabs.Trigger value="imports">{t('imports', 'Imports')}</Tabs.Trigger>}
            {canExport && <Tabs.Trigger value="exports">{t('exports', 'Exports')}</Tabs.Trigger>}
          </Tabs.List>
        </div>
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-4xl p-6">
            <p className="mb-4 text-sm text-muted-foreground">
              {t(
                'intro',
                'Import from CSV or Excel with the Import button on Customers, Leads or Companies; export a list with its Export button.',
              )}
            </p>
            {tab === 'imports' && canImport && <ImportsList />}
            {tab === 'exports' && canExport && <ExportsList />}
          </div>
        </ScrollArea>
      </Tabs>
    </PageContainer>
  );
};
