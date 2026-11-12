import type { TransferColumn, TransferRecordType } from '@erxes/core-contract';
import { IconDownload } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Dialog, Label, Select, Spinner, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { messageOf, orpc } from '~/lib/api';
import { useCan } from '~/modules/auth/session';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';
import { useListQuery } from '~/modules/contacts/views/useViews';
import { useTransferColumns } from './useTransfer';

const ColumnPicker = ({
  columns,
  selected,
  onChange,
}: {
  columns: TransferColumn[];
  selected: string[];
  onChange: (keys: string[]) => void;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'transfer' });

  return (
    <fieldset className="space-y-1.5">
      <div className="flex items-center">
        <legend className="flex-1 text-sm font-medium">{t('columns', 'Columns')}</legend>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:underline"
          onClick={() => onChange(columns.map((column) => column.key))}
        >
          {t('all-columns', 'All')}
        </button>
      </div>
      <div className="grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto rounded-md border p-2">
        {columns.map((column) => (
          <label key={column.key} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={selected.includes(column.key)}
              onCheckedChange={(on) =>
                onChange(
                  on === true
                    ? [...selected, column.key]
                    : selected.filter((key) => key !== column.key),
                )
              }
            />
            <span className="truncate">{column.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

const FormatPicker = ({
  value,
  onChange,
}: {
  value: 'csv' | 'xlsx';
  onChange: (format: 'csv' | 'xlsx') => void;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'transfer' });
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t('format', 'Format')}</Label>
      <Select value={value} onValueChange={(next) => onChange(next === 'csv' ? 'csv' : 'xlsx')}>
        <Select.Trigger id={id}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="xlsx">{t('xlsx', 'Excel (.xlsx)')}</Select.Item>
          <Select.Item value="csv">{t('csv', 'CSV (UTF-8)')}</Select.Item>
        </Select.Content>
      </Select>
    </div>
  );
};

const useStartExport = (onStarted: () => void) => {
  const { t } = useTranslation('contact', { keyPrefix: 'transfer' });
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.transfer.createExport.mutationOptions({
      onSuccess: () => {
        onStarted();
        toast({
          title: t('export-started', 'Export started'),
          description: t(
            'export-started-description',
            "You'll get a notification when the file is ready (Settings › Import & export).",
          ),
        });

        return client.invalidateQueries({ queryKey: orpc.transfer.exports.key() });
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('export-failed', 'Could not export'),
          description: messageOf(error),
        }),
    }),
  );
};

/** "Export": what the list shows (its filters and view) to CSV or Excel, with chosen columns, in the background. */
export const ExportButton = ({
  recordType,
  query,
}: {
  recordType: TransferRecordType;
  query: { tagIds?: string[]; ownerId?: string };
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'transfer' });
  const can = useCan();
  const columns = useTransferColumns(recordType);
  const exportable = (columns.data ?? []).filter((column) => column.exportable);
  const list = useListQuery();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [chosen, setChosen] = useState<string[] | null>(null);

  const selected =
    chosen ?? exportable.filter((column) => column.default).map((column) => column.key);

  const filtered =
    list.advanced !== null ||
    Boolean(list.search) ||
    Boolean(query.tagIds?.length) ||
    Boolean(query.ownerId);

  const start = useStartExport(() => setOpen(false));

  if (!can('contacts.export')) return null;

  const submit = () =>
    start.mutate({
      recordType,
      format,
      columns: exportable
        .filter((column) => selected.includes(column.key))
        .map((column) => column.key),
      query: {
        filter: list.advanced,
        search: list.search || undefined,
        tagIds: query.tagIds,
        ownerId: query.ownerId,
      },
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          <IconDownload />
          {t('export', 'Export')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-lg">
        <Dialog.HeaderCombined
          title={t('export-title', 'Export')}
          description={
            filtered
              ? t('export-filtered', 'The records this list shows now, with its filters.')
              : t('export-all', 'Every record in this list.')
          }
        />
        <div className="space-y-4">
          <FormatPicker value={format} onChange={setFormat} />
          {columns.error ? (
            <p className="text-sm text-destructive">{messageOf(columns.error)}</p>
          ) : (
            <ColumnPicker columns={exportable} selected={selected} onChange={setChosen} />
          )}
          <ExportFooter
            disabled={!selected.length || start.isPending}
            pending={start.isPending}
            onExport={submit}
          />
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

/** Past exports, then the button that starts this one. */
const ExportFooter = ({
  disabled,
  pending,
  onExport,
}: {
  disabled: boolean;
  pending: boolean;
  onExport: () => void;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'transfer' });

  return (
    <div className="flex items-center gap-2">
      <Link
        to={CONTACT_SETTINGS.importExport}
        className="text-xs text-muted-foreground hover:underline"
      >
        {t('history', 'Past exports')}
      </Link>
      <Button className="ml-auto" disabled={disabled} onClick={onExport}>
        {pending ? <Spinner size="sm" /> : <IconDownload />}
        {t('export-start', 'Export')}
      </Button>
    </div>
  );
};
