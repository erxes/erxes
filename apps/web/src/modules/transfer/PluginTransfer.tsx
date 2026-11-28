import type { TransferRecordType } from '@erxes/core-contract';
import {
  IconArrowRight,
  IconChevronDown,
  IconDownload,
  IconFileSpreadsheet,
  IconHistory,
  IconUpload,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  buttonVariants,
  type Export,
  type Import,
  Popover,
  ScrollArea,
  Spinner,
} from 'erxes-ui';
import type { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { ExportDialog } from './ExportButton';
import { ExportRow, ImportRow } from './TransferRows';
import { useStartImport } from './useStartImport';
import { useExports, useImports, useTransferLabel, useTransferType } from './useTransfer';

type ImportProps = ComponentProps<typeof Import>;

type ExportProps = ComponentProps<typeof Export>;

const RUNNING = new Set(['parsing', 'checking', 'running']);

/** A heading with an icon tile, a badge and a line, as 3.x's transfer popovers opened. */
const PopoverIntro = ({
  icon: Icon,
  title,
  badge,
  description,
  children,
}: {
  icon: typeof IconUpload;
  title: string;
  badge: string;
  description: string;
  children?: ReactNode;
}) => (
  <div className="border-b bg-muted/30 px-5 py-4">
    <div className="flex items-start gap-3">
      <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary-text">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold">{title}</h3>
          <Badge variant="info">{badge}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        {children}
      </div>
    </div>
  </div>
);

/** What shows while a list is empty: an icon, a title and a line. */
const Quiet = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-xl border bg-muted/20 p-4">
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-background p-2 shadow-sm">
        <IconHistory className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

/** A plugin page's Import: 3.x's popover over core's import of `recordType`. */
export const PluginImport = ({ recordType, title, children }: ImportProps) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export.button' });
  const type = useTransferType(recordType);
  const labelOf = useTransferLabel();
  const { picker, choose, pending } = useStartImport(recordType);
  const imports = useImports();

  const running = (imports.data?.data ?? []).filter(
    (item) => item.recordType === recordType && RUNNING.has(item.status),
  );

  if (!type?.canImport) return null;

  return (
    <>
      {picker}
      <Popover>
        <Popover.Trigger render={<Button variant="outline" />}>
          {pending ? <Spinner size="sm" /> : <IconUpload />}
          {t('import', 'Import')}
          {running.length > 0 && <Badge variant="info">{running.length}</Badge>}
        </Popover.Trigger>
        <Popover.Content align="end" variant="flush" className="w-92 max-w-(--available-width)">
          <ScrollArea className="max-h-(--available-height)">
            <PopoverIntro
              icon={IconFileSpreadsheet}
              title={title ?? t('upload', 'Upload CSV')}
              badge={t('file-types', 'CSV or Excel')}
              description={t(
                'import-description',
                'Upload a file to create or update {{entity}} in bulk: you match its columns and check its rows before they import.',
                { entity: labelOf(recordType) },
              )}
            >
              {children}
            </PopoverIntro>
            <div className="grid grid-cols-2 gap-2 px-5 py-4">
              <Button className="w-full" disabled={pending} onClick={choose}>
                {t('import-now', 'Import now')}
              </Button>
              <Link
                to={paths.contacts.importExport}
                className={buttonVariants({
                  variant: 'outline',
                  className: 'w-full justify-between',
                })}
              >
                {t('history', 'History')}
                <IconArrowRight />
              </Link>
            </div>
            <div className="space-y-2 p-5">
              {running.length ? (
                <>
                  <p className="text-sm font-medium">{t('current-imports', 'Current imports')}</p>
                  <ul className="divide-y rounded-lg border text-sm">
                    {running.map((item) => (
                      <ImportRow key={item.id} item={item} />
                    ))}
                  </ul>
                </>
              ) : (
                <Quiet
                  title={t('no-imports', 'No imports running')}
                  description={t(
                    'no-imports-description',
                    'Your latest uploads will appear here so you can follow their progress.',
                  )}
                />
              )}
            </div>
          </ScrollArea>
        </Popover.Content>
      </Popover>
    </>
  );
};

/** The type's recent exports, to download again, beside a plugin page's Export. */
const RecentExports = ({
  recordType,
  variant,
}: {
  recordType: TransferRecordType;
  variant: ExportProps['buttonVariant'];
}) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export.button' });
  const exports = useExports();

  const recent = (exports.data?.data ?? [])
    .filter((item) => item.recordType === recordType)
    .slice(0, 5);

  return (
    <Popover>
      <Popover.Trigger
        render={
          <Button
            variant={variant}
            size="icon"
            aria-label={t('recent-exports', 'Recent exports')}
          />
        }
      >
        <IconChevronDown />
      </Popover.Trigger>
      <Popover.Content align="end" className="w-96">
        <div className="space-y-3">
          <p className="text-sm font-medium">{t('recent-exports', 'Recent exports')}</p>
          {recent.length ? (
            <ul className="divide-y rounded-lg border text-sm">
              {recent.map((item) => (
                <ExportRow key={item.id} item={item} />
              ))}
            </ul>
          ) : (
            <Quiet
              title={t('no-exports', 'No recent exports yet')}
              description={t(
                'no-exports-description',
                'Your exported files will show up here so you can download them again.',
              )}
            />
          )}
        </div>
      </Popover.Content>
    </Popover>
  );
};

/** A plugin page's Export: core's export of `recordType`, of the selected rows or the list's filter. */
export const PluginExport = ({
  recordType,
  buttonVariant = 'outline',
  ids,
  getFilters,
}: ExportProps) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'import-export.button' });
  const type = useTransferType(recordType);

  if (!type?.canExport) return null;

  const params = ids?.length ? undefined : getFilters?.();

  return (
    <div className="flex items-center gap-px">
      <ExportDialog
        recordType={recordType}
        query={ids?.length ? { ids } : { params }}
        filtered={Boolean(ids?.length) || Object.keys(params ?? {}).length > 0}
        trigger={<Button variant={buttonVariant} />}
      >
        <IconDownload />
        {t('export', 'Export')}
      </ExportDialog>
      <RecentExports recordType={recordType} variant={buttonVariant} />
    </div>
  );
};
