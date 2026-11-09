import { gql, useApolloClient } from '@apollo/client';
import { IconDownload, IconFileImport } from '@tabler/icons-react';
import { Button, Select, Sheet, Spinner, Table, toast } from 'erxes-ui';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buildCreateMutation,
  buildListQuery,
  IDataExtensionField,
  IDataExtensionFilter,
  IDataExtensionRecordType,
  toDataExtensionRecordResult,
  typedRequestOptions,
  useDataExtensionRecordTypes,
} from 'ui-modules';
import { fromCsvValue, parseCsv, toCsv, toCsvValue } from '../utils/csv';

/** Exports stop here so one click cannot pull a whole database into a tab. */
const EXPORT_MAX = 5000;
const EXPORT_PAGE = 100;
const IMPORT_MAX = 2000;
const IMPORT_CONCURRENCY = 4;
const NAME_COLUMN = '__name__';
const SKIP_COLUMN = '__skip__';

const download = (fileName: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export the current view to CSV and import a CSV as new records. Every
 * imported row goes through the same create as the record sheet, so
 * defaults, required fields and unique values apply.
 */
export const DataExtensionCsvActions = ({
  recordType,
  fields,
  filter,
  canImport,
  onImported,
}: {
  recordType: IDataExtensionRecordType;
  fields: IDataExtensionField[];
  filter: IDataExtensionFilter;
  canImport: boolean;
  onImported: () => void;
}) => {
  const { t } = useTranslation('dataExtensions');
  const client = useApolloClient();
  const { recordTypes } = useDataExtensionRecordTypes();
  const [exporting, setExporting] = useState(false);
  const [rows, setRows] = useState<string[][] | null>(null);
  const [mapping, setMapping] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ done: number; failed: { row: number; error: string }[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [fileRows, setFileRows] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const columns = useMemo(() => fields.filter((field) => !field.relation || field.relation.side === 'source'), [fields]);

  const exportCsv = async () => {
    setExporting(true);

    try {
      const query = gql(buildListQuery(recordType, fields, recordTypes));
      const out: string[][] = [[t('records.name'), ...columns.map((field) => field.label)]];

      for (let skip = 0; skip < EXPORT_MAX; skip += EXPORT_PAGE) {
        const { data } = await client.query({
          query,
          variables: { filter, limit: EXPORT_PAGE, skip, sortField: 'createdAt', sortDirection: 1 },
          ...typedRequestOptions,
        });
        const page = data.page.list as Record<string, unknown>[];

        for (const raw of page) {
          const result = toDataExtensionRecordResult(recordType, fields, raw as never);

          out.push([
            String(raw.name || ''),
            ...columns.map((field) => toCsvValue(field, result.values[field.key])),
          ]);
        }

        if (page.length < EXPORT_PAGE) {
          break;
        }
      }

      download(`${recordType.label}.csv`, toCsv(out));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('csv.export-failed'),
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setExporting(false);
    }
  };

  /** Columns matched to fields by label or key; the name by its header. */
  const readFile = async (file: File) => {
    const parsed = parseCsv(await file.text());

    if (parsed.length < 2) {
      toast({ variant: 'destructive', title: t('csv.empty-file') });
      return;
    }

    const [header] = parsed;
    const nameHeaders = ['name', t('records.name').toLowerCase()];

    setMapping(
      header.map((cell) => {
        const lower = cell.trim().toLowerCase();

        if (nameHeaders.includes(lower)) {
          return NAME_COLUMN;
        }

        return (
          columns.find(
            (field) => field.label.toLowerCase() === lower || field.key.toLowerCase() === lower,
          )?.key || SKIP_COLUMN
        );
      }),
    );
    setFileRows(parsed.length - 1);
    setRows(parsed.slice(0, IMPORT_MAX + 1));
    setProgress(null);
  };

  const runImport = async () => {
    if (!rows) {
      return;
    }

    const body = rows.slice(1);
    const nameIndex = mapping.indexOf(NAME_COLUMN);
    const mutation = gql(buildCreateMutation(recordType, fields, recordTypes));
    const failed: { row: number; error: string }[] = [];
    let done = 0;
    let next = 0;

    setImporting(true);
    setProgress({ done: 0, failed: [] });

    const importRow = async (index: number) => {
      const cells = body[index];

      try {
        const name = nameIndex >= 0 ? cells[nameIndex]?.trim() : '';

        if (!name) {
          throw new Error(t('csv.name-missing'));
        }

        const values: Record<string, unknown> = {};

        mapping.forEach((key, column) => {
          const field = fields.find((candidate) => candidate.key === key);

          if (field) {
            const value = fromCsvValue(field, cells[column] || '');

            if (value !== undefined) {
              values[key] = value;
            }
          }
        });

        await client.mutate({
          mutation,
          variables: { input: { name, ...(fields.length ? { values } : {}) } },
          ...typedRequestOptions,
        });
      } catch (error) {
        failed.push({ row: index + 2, error: error instanceof Error ? error.message : String(error) });
      } finally {
        done++;
        setProgress({ done, failed: [...failed] });
      }
    };

    await Promise.all(
      Array.from({ length: IMPORT_CONCURRENCY }, async () => {
        while (next < body.length) {
          await importRow(next++);
        }
      }),
    );

    setImporting(false);
    onImported();
    toast({
      variant: failed.length ? 'destructive' : 'success',
      title: t('csv.imported', { count: body.length - failed.length, total: body.length }),
    });
  };

  const total = rows ? rows.length - 1 : 0;

  return (
    <>
      <Button variant="ghost" disabled={exporting} onClick={exportCsv} title={t('csv.export')}>
        {exporting ? <Spinner size="sm" /> : <IconDownload />}
        <span className="hidden xl:inline">{t('csv.export')}</span>
      </Button>
      {canImport && (
        <>
          <Button variant="ghost" onClick={() => fileRef.current?.click()} title={t('csv.import')}>
            <IconFileImport />
            <span className="hidden xl:inline">{t('csv.import')}</span>
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                readFile(file);
              }

              event.target.value = '';
            }}
          />
        </>
      )}
      <Sheet open={Boolean(rows)} onOpenChange={(open) => !open && !importing && setRows(null)}>
        <Sheet.View className="p-0 sm:max-w-3xl">
          <Sheet.Header>
            <Sheet.Title>{t('csv.import-title', { label: recordType.label })}</Sheet.Title>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="flex flex-col gap-4 overflow-y-auto p-5">
            <p className="text-sm text-muted-foreground">
              {t('csv.import-hint', { count: fileRows })}
              {fileRows > IMPORT_MAX && ` ${t('csv.import-capped', { count: IMPORT_MAX })}`}
            </p>
            {rows && (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      {rows[0].map((header, column) => (
                        <Table.Head key={column} className="min-w-40 align-top">
                          <span className="block truncate pb-1 normal-case">{header}</span>
                          <Select
                            value={mapping[column]}
                            onValueChange={(value) =>
                              setMapping((current) =>
                                current.map((item, index) => (index === column ? value : item)),
                              )
                            }
                          >
                            <Select.Trigger className="h-7 text-xs" aria-label={t('csv.map', { column: header })}>
                              <Select.Value />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value={SKIP_COLUMN}>{t('csv.skip')}</Select.Item>
                              <Select.Item value={NAME_COLUMN}>{t('records.name')}</Select.Item>
                              {columns.map((field) => (
                                <Select.Item key={field.key} value={field.key}>
                                  {field.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </Table.Head>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {rows.slice(1, 6).map((cells, index) => (
                      <Table.Row key={index}>
                        {cells.map((cell, column) => (
                          <Table.Cell key={column} className="max-w-48 truncate text-xs">
                            {cell}
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
            {!mapping.includes(NAME_COLUMN) && (
              <p className="text-xs text-destructive" role="alert">
                {t('csv.need-name')}
              </p>
            )}
            {progress && (
              <div className="flex flex-col gap-2" aria-live="polite">
                <p className="text-sm tabular-nums">
                  {t('csv.progress', { done: progress.done, total })}
                </p>
                {progress.failed.length > 0 && (
                  <ul className="max-h-48 overflow-y-auto rounded-md border p-2 text-xs">
                    {progress.failed
                      .sort((a, b) => a.row - b.row)
                      .map((failure) => (
                        <li key={failure.row} className="text-destructive">
                          {t('csv.row-failed', { row: failure.row, error: failure.error })}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}
          </Sheet.Content>
          <Sheet.Footer>
            <Button variant="ghost" disabled={importing} onClick={() => setRows(null)}>
              {progress && !importing ? t('records.close') : t('cancel')}
            </Button>
            {!(progress && !importing) && (
              <Button disabled={importing || !mapping.includes(NAME_COLUMN)} onClick={runImport}>
                {importing && <Spinner size="sm" />}
                {t('csv.import-rows', { count: Math.min(total, IMPORT_MAX) })}
              </Button>
            )}
          </Sheet.Footer>
        </Sheet.View>
      </Sheet>
    </>
  );
};
