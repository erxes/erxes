import type { TransferType } from '@erxes/core-contract';
import { IconFileExport, IconFileImport } from '@tabler/icons-react';
import {
  AppBreadcrumb,
  Empty,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  Tabs,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { parseAsString, useQueryStates } from 'nuqs';
import { Navigate } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { ExportButton } from '~/modules/transfer/ExportButton';
import { ImportButton } from '~/modules/transfer/ImportButton';
import { ExportRow, ImportRow } from '~/modules/transfer/TransferRows';
import {
  useExports,
  useImports,
  useTransferLabel,
  useTransferTypes,
} from '~/modules/transfer/useTransfer';

const Nothing = ({ icon: Icon, title }: { icon: typeof IconFileImport; title: string }) => (
  <Empty>
    <Empty.Header>
      <Empty.Media variant="icon">
        <Icon />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
    </Empty.Header>
  </Empty>
);

const ImportsList = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export' });

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
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export' });

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

/** Installed plugins' records, which have no Import or Export button in core's lists: one row each. */
const PluginRecords = ({ types }: { types: TransferType[] }) => {
  const labelOf = useTransferLabel();
  const plugins = types.filter((type) => type.plugin);

  if (!plugins.length) return null;

  return (
    <ul className="mb-6 divide-y rounded-lg border text-sm">
      {plugins.map((type) => (
        <li key={type.recordType} className="flex items-center gap-2 p-3">
          <span className="flex-1 font-medium first-letter:uppercase">
            {labelOf(type.recordType)}
          </span>
          <ImportButton recordType={type.recordType} />
          <ExportButton recordType={type.recordType} />
        </li>
      ))}
    </ul>
  );
};

/**
 * Contacts › Settings › Import & export history: past imports (continue, see results, undo) and
 * exports (download), and the Import and Export of installed plugins' records.
 */
export const ImportExportPage = () => {
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export' });
  const types = useTransferTypes();

  const [params, setParams] = useQueryStates({
    import: parseAsString,
    export: parseAsString,
    tab: parseAsString,
  });

  if (types.isPending) return <Spinner area="lg" />;

  const canImport = types.data?.some((type) => type.canImport) ?? false;
  const canExport = types.data?.some((type) => type.canExport) ?? false;

  if (!canImport && !canExport) return <Navigate to={paths.settings.root} replace />;

  const highlighted = params.import;

  if (highlighted) return <Navigate to={paths.contacts.importOrExport(highlighted)} replace />;

  const tab = params.tab ?? (params.export || !canImport ? 'exports' : 'imports');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Import & export history'),
                to: paths.contacts.importExport,
                icon: IconFileImport,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <Tabs
        value={tab}
        onValueChange={(next) => void setParams({ tab: next, import: null, export: null })}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="border-b px-4">
          <Tabs.List variant="flush" className="h-9">
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
            <PluginRecords types={types.data ?? []} />
            {tab === 'imports' && canImport && <ImportsList />}
            {tab === 'exports' && canExport && <ExportsList />}
          </div>
        </ScrollArea>
      </Tabs>
    </PageContainer>
  );
};
