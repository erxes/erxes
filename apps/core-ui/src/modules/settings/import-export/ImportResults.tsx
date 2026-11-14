import type { Import, ImportRow } from '@erxes/core-contract';
import type { z } from 'zod';
import { IconAlertTriangle, IconCheck, IconDownload } from '@tabler/icons-react';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { Badge, Button, Spinner, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { messageOf, orpc } from '~/lib/api';
import { RECORD_PATHS } from '~/modules/transfer/useTransfer';

const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** The rows with errors as a CSV the member can fix and import again. */
const saveErrorsCsv = (headers: string[], rows: z.infer<typeof ImportRow>[]) => {
  const text = [
    '﻿' + ['Row', 'Error', ...headers].map(quote).join(','),
    ...rows.map((row) =>
      [String(row.rowNumber), row.error ?? '', ...row.cells].map(quote).join(','),
    ),
  ].join('\n');

  const link = document.createElement('a');

  link.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  link.download = 'import-errors.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};

const Counts = ({ imp }: { imp: Import }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const finished = imp.status === 'done' || imp.status === 'undone';

  const items: {
    key: keyof Import['counts'];
    label: string;
    done: string;
    tone: 'success' | 'info' | 'secondary' | 'destructive';
  }[] = [
    {
      key: 'create',
      label: t('count-create', 'to create'),
      done: t('count-created', 'created'),
      tone: 'success',
    },
    {
      key: 'update',
      label: t('count-update', 'to update'),
      done: t('count-updated', 'updated'),
      tone: 'info',
    },
    {
      key: 'skip',
      label: t('count-skip', 'skipped'),
      done: t('count-skip', 'skipped'),
      tone: 'secondary',
    },
    {
      key: 'error',
      label: t('count-error', 'with errors'),
      done: t('count-error', 'with errors'),
      tone: 'destructive',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item.key} variant={item.tone} size="lg">
          {imp.counts[item.key].toLocaleString()} {finished ? item.done : item.label}
        </Badge>
      ))}
    </div>
  );
};

/** The first rows with errors; mounted per status so a new check shows its own. */
export const ErrorRows = ({ imp }: { imp: Import }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const { toast } = useToast();

  const rows = useQuery(
    orpc.transfer.importRows.queryOptions({
      input: imp.counts.error > 0 ? { id: imp.id, action: 'error', limit: 50 } : skipToken,
    }),
  );

  const download = useMutation({
    mutationFn: () => orpc.transfer.importRows.call({ id: imp.id, action: 'error', limit: 1000 }),
    onSuccess: ({ data }) => saveErrorsCsv(imp.headers, data),
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('failed', 'Something went wrong'),
        description: messageOf(error),
      }),
  });

  if (!imp.counts.error) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium text-destructive">
          <IconAlertTriangle className="size-4" />
          {t('errors-title', 'Rows with errors')}
        </h3>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto h-7"
          disabled={download.isPending}
          onClick={() => download.mutate()}
        >
          <IconDownload />
          {t('errors-download', 'Download to fix')}
        </Button>
      </div>
      {rows.isPending ? (
        <Spinner size="sm" />
      ) : rows.error ? (
        <p className="text-sm text-destructive">{messageOf(rows.error)}</p>
      ) : (
        <ul className="divide-y rounded-lg border text-sm">
          {rows.data.data.map((row) => (
            <li key={row.rowNumber} className="flex gap-3 p-2">
              <span className="w-14 shrink-0 text-muted-foreground">
                {t('row', 'Row {{n}}', { n: row.rowNumber })}
              </span>
              <span className="text-destructive">{row.error}</span>
            </li>
          ))}
        </ul>
      )}
      {imp.counts.error > 50 && (
        <p className="text-xs text-muted-foreground">
          {t('errors-more', 'The first 50 are shown; download them all to fix.')}
        </p>
      )}
    </section>
  );
};

/** Reading, checking or importing in the background, with how far it got. */
export const ImportProgress = ({ imp }: { imp: Import }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const percent = imp.counts.rows ? Math.round((imp.processed / imp.counts.rows) * 100) : 0;

  if (imp.status === 'parsing') {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Spinner size="sm" /> {t('parsing', 'Reading the file…')}
      </div>
    );
  }

  if (imp.status === 'failed') {
    return (
      <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
        {imp.error}
      </p>
    );
  }

  if (imp.status !== 'checking' && imp.status !== 'running') return null;

  return (
    <section className="space-y-2">
      <p className="text-sm">
        {imp.status === 'checking'
          ? t('checking', 'Checking every row…')
          : t('running', 'Importing…')}{' '}
        {imp.processed.toLocaleString()} / {imp.counts.rows.toLocaleString()}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full w-(--progress) rounded-full bg-primary transition-layout"
          style={{ '--progress': `${percent}%` }}
        />
      </div>
    </section>
  );
};

/** What a check found, or what the import did. */
export const ImportSummary = ({ imp, noun }: { imp: Import; noun: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });

  if (imp.status !== 'checked' && imp.status !== 'done' && imp.status !== 'undone') return null;

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h2 className="flex items-center gap-2 text-sm font-medium">
        <IconCheck className="size-4 text-success" />
        {imp.status === 'checked'
          ? t('checked', 'Checked: nothing has changed yet')
          : imp.status === 'undone'
            ? t('undone', 'Undone: the records it created are in the recycle bin')
            : t('done', 'Imported')}
      </h2>
      <Counts imp={imp} />
      {imp.status === 'done' && (
        <Link
          to={RECORD_PATHS[imp.recordType]}
          className="text-sm text-primary-text hover:underline"
        >
          {t('open-list', 'Open {{noun}}', { noun })}
        </Link>
      )}
    </section>
  );
};
