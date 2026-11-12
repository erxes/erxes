import type { TransferRecordType } from '@erxes/core-contract';
import { IconDownload, IconFileImport } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Dialog, Label, Select, Spinner, useToast } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { api, messageOf } from '~/lib/api';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import { useCan } from '~/modules/auth/session';
import { useListQuery } from '~/modules/contacts/views/useViews';
import { EXPORTS_KEY, IMPORTS_KEY, useTransferColumns } from './useTransfer';

/** "Import": pick a CSV or Excel file; it is uploaded and opens in the import wizard. */
export const ImportButton = ({ recordType }: { recordType: TransferRecordType }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'transfer' });
  const can = useCan();
  const navigate = useNavigate();
  const client = useQueryClient();
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!can('contacts.import')) return null;

  const start = async (file: File) => {
    setBusy(true);

    try {
      const uploaded = await uploadFile(file);
      const created = await api.transfer.createImport({ recordType, fileId: uploaded.id });

      void client.invalidateQueries({ queryKey: IMPORTS_KEY });
      navigate(`/settings/import-export/${created.id}`);
    } catch (error) {
      toast({ variant: 'destructive', title: t('upload-failed', 'Could not start the import'), description: uploadErrorMessage(error) });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(event) => event.target.files?.[0] && void start(event.target.files[0])}
      />
      <Button variant="outline" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <Spinner size="sm" /> : <IconFileImport />}
        {t('import', 'Import')}
      </Button>
    </>
  );
};

/** "Export": what the list shows (its filters and view) to CSV or Excel, with chosen columns, in the background. */
export const ExportButton = ({ recordType, query }: { recordType: TransferRecordType; query: { tagIds?: string[]; ownerId?: string } }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'transfer' });
  const can = useCan();
  const client = useQueryClient();
  const { toast } = useToast();
  const columns = useTransferColumns(recordType).filter((column) => column.exportable);
  const list = useListQuery();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [chosen, setChosen] = useState<string[] | null>(null);
  const selected = chosen ?? columns.filter((column) => column.default).map((column) => column.key);
  const filtered = Boolean(list.advanced || list.search || query.tagIds?.length || query.ownerId);
  const start = useMutation({
    mutationFn: () =>
      api.transfer.createExport({
        recordType,
        format,
        columns: columns.filter((column) => selected.includes(column.key)).map((column) => column.key),
        query: { filter: list.advanced, search: list.search || undefined, tagIds: query.tagIds, ownerId: query.ownerId },
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: EXPORTS_KEY });
      setOpen(false);
      toast({
        title: t('export-started', 'Export started'),
        description: t('export-started-description', "You'll get a notification when the file is ready (Settings › Import & export)."),
      });
    },
    onError: (error) => toast({ variant: 'destructive', title: t('export-failed', 'Could not export'), description: messageOf(error) }),
  });

  if (!can('contacts.export')) return null;

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
          description={filtered ? t('export-filtered', 'The records this list shows now, with its filters.') : t('export-all', 'Every record in this list.')}
        />
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('format', 'Format')}</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as 'csv' | 'xlsx')}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="xlsx">{t('xlsx', 'Excel (.xlsx)')}</Select.Item>
                <Select.Item value="csv">{t('csv', 'CSV (UTF-8)')}</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center">
              <Label className="flex-1">{t('columns', 'Columns')}</Label>
              <button type="button" className="text-xs text-muted-foreground hover:underline" onClick={() => setChosen(columns.map((column) => column.key))}>
                {t('all-columns', 'All')}
              </button>
            </div>
            <div className="grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto rounded-md border p-2">
              {columns.map((column) => (
                <label key={column.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selected.includes(column.key)}
                    onCheckedChange={(on) => setChosen(on === true ? [...selected, column.key] : selected.filter((key) => key !== column.key))}
                  />
                  <span className="truncate">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/settings/import-export" className="text-xs text-muted-foreground hover:underline">
              {t('history', 'Past exports')}
            </Link>
            <Button className="ml-auto" disabled={!selected.length || start.isPending} onClick={() => start.mutate()}>
              {start.isPending ? <Spinner size="sm" /> : <IconDownload />}
              {t('export-start', 'Export')}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
