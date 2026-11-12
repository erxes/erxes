import type { Import, ImportOptions } from '@erxes/core-contract';
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconCheck,
  IconDownload,
  IconFileImport,
  IconPlayerPlay,
  IconSearch,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  cn,
  Label,
  MultipleSelector,
  PageContainer,
  ScrollArea,
  Select,
  Spinner,
  Switch,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, messageOf } from '~/lib/api';
import {
  IMPORTS_KEY,
  RECORD_PATHS,
  useImport,
  useTransferColumns,
} from '~/modules/transfer/useTransfer';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';

const IGNORE = '__ignore__';
const NOUNS = { customer: 'customers', lead: 'leads', company: 'companies' } as const;

const useMembers = () =>
  useQuery({
    queryKey: ['transfer', 'members'],
    queryFn: async () =>
      (await api.users.list({ limit: 100 })).data.map((user) => ({
        value: user.id,
        label: user.fullName || user.email,
      })),
    staleTime: 60_000,
  }).data ?? [];

const useTags = (type: 'customer' | 'company') =>
  useQuery({
    queryKey: ['transfer', 'tags', type],
    queryFn: async () =>
      (await api.tags.list({ type })).data.map((tag) => ({ value: tag.id, label: tag.name })),
    staleTime: 60_000,
  }).data ?? [];

/** The rows with errors as a CSV the member can fix and import again. */
const downloadErrors = async (id: string, headers: string[]) => {
  const rows = (await api.transfer.importRows({ id, action: 'error', limit: 1000 })).data;
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;

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

  const items = [
    {
      key: 'create',
      label: t('count-create', 'to create'),
      done: t('count-created', 'created'),
      tone: 'success' as const,
    },
    {
      key: 'update',
      label: t('count-update', 'to update'),
      done: t('count-updated', 'updated'),
      tone: 'info' as const,
    },
    {
      key: 'skip',
      label: t('count-skip', 'skipped'),
      done: t('count-skip', 'skipped'),
      tone: 'secondary' as const,
    },
    {
      key: 'error',
      label: t('count-error', 'with errors'),
      done: t('count-error', 'with errors'),
      tone: 'destructive' as const,
    },
  ];

  const finished = imp.status === 'done' || imp.status === 'undone';

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item.key} variant={item.tone} className="px-2.5 py-1 text-sm">
          {imp.counts[item.key as keyof Import['counts']].toLocaleString()}{' '}
          {finished ? item.done : item.label}
        </Badge>
      ))}
    </div>
  );
};

const ErrorRows = ({ imp }: { imp: Import }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });

  const rows = useQuery({
    queryKey: [...IMPORTS_KEY, imp.id, 'errors', imp.status],
    queryFn: () => api.transfer.importRows({ id: imp.id, action: 'error', limit: 50 }),
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
          onClick={() => void downloadErrors(imp.id, imp.headers)}
        >
          <IconDownload />
          {t('errors-download', 'Download to fix')}
        </Button>
      </div>
      {rows.isLoading ? (
        <Spinner size="sm" />
      ) : (
        <ul className="divide-y rounded-lg border text-sm">
          {rows.data?.data.map((row) => (
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

/**
 * One import, step by step: map the file's columns (suggested from their
 * names, with sample values), choose how rows find existing records, check
 * (a dry run), run, and undo within 30 days.
 */
export const ImportWizardPage = () => {
  const { id = '' } = useParams();
  const { t } = useTranslation('settings', { keyPrefix: 'import-export' });
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const client = useQueryClient();
  const { data: imp } = useImport(id);

  const columns = useTransferColumns(imp?.recordType ?? 'customer').filter(
    (column) => column.importable,
  );

  const members = useMembers();
  const tags = useTags(imp?.recordType === 'company' ? 'company' : 'customer');
  const set = (next: Import) => client.setQueryData([...IMPORTS_KEY, id], next);

  const onError = (error: unknown) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Something went wrong'),
      description: messageOf(error),
    });

  const update = useMutation({
    mutationFn: (changes: { mapping?: Record<string, string>; options?: Partial<ImportOptions> }) =>
      api.transfer.updateImport({ id, ...changes }),
    onSuccess: set,
    onError,
  });

  const check = useMutation({
    mutationFn: () => api.transfer.checkImport({ id }),
    onSuccess: set,
    onError,
  });

  const start = useMutation({
    mutationFn: () => api.transfer.startImport({ id }),
    onSuccess: set,
    onError,
  });

  const undo = useMutation({
    mutationFn: () => api.transfer.undoImport({ id }),
    onSuccess: set,
    onError,
  });

  if (!imp) return <Spinner containerClassName="py-12" />;

  const editable = imp.status === 'mapping' || imp.status === 'checked';
  const percent = imp.counts.rows ? Math.round((imp.processed / imp.counts.rows) * 100) : 0;
  const noun = t(`noun.${imp.recordType}`, NOUNS[imp.recordType]);
  const options = imp.options;
  const isCompany = imp.recordType === 'company';

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
              { label: imp.fileName, to: `${CONTACT_SETTINGS.importExport}/${id}` },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {editable && (
            <>
              <Button variant="outline" disabled={check.isPending} onClick={() => check.mutate()}>
                <IconSearch />
                {t('check', 'Check')}
              </Button>
              <Button disabled={start.isPending} onClick={() => start.mutate()}>
                <IconPlayerPlay />
                {t('start', 'Import {{count}} rows', { count: imp.counts.rows })}
              </Button>
            </>
          )}
          {imp.undoable && (
            <Button
              variant="outline"
              className="text-destructive"
              disabled={undo.isPending}
              onClick={() =>
                void confirm({
                  message: t(
                    'undo-confirm',
                    'Remove the {{count}} {{noun}} this import created? They go to the recycle bin; updates stay.',
                    { count: imp.counts.create, noun },
                  ),
                }).then(() => undo.mutate())
              }
            >
              <IconArrowBackUp />
              {t('undo', 'Undo import')}
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          {imp.status === 'parsing' && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Spinner size="sm" /> {t('parsing', 'Reading the file…')}
            </div>
          )}
          {imp.status === 'failed' && (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {imp.error}
            </p>
          )}
          {(imp.status === 'checking' || imp.status === 'running') && (
            <section className="space-y-2">
              <p className="text-sm">
                {imp.status === 'checking'
                  ? t('checking', 'Checking every row…')
                  : t('running', 'Importing…')}{' '}
                {imp.processed.toLocaleString()} / {imp.counts.rows.toLocaleString()}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </section>
          )}
          {(imp.status === 'checked' || imp.status === 'done' || imp.status === 'undone') && (
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
                  className="text-sm text-primary hover:underline"
                >
                  {t('open-list', 'Open {{noun}}', { noun })}
                </Link>
              )}
            </section>
          )}
          <ErrorRows imp={imp} />
          {editable && (
            <>
              <section className="space-y-2">
                <h2 className="text-sm font-medium">{t('mapping', 'Columns')}</h2>
                <p className="text-xs text-muted-foreground">
                  {t(
                    'mapping-hint',
                    'Suggested from the column names; choose another field or leave a column out.',
                  )}
                </p>
                <div className="divide-y rounded-lg border">
                  {imp.headers.map((header, index) => {
                    const value = imp.mapping[String(index)] ?? IGNORE;

                    const samples = imp.sample
                      .map((row) => row[index])
                      .filter(Boolean)
                      .slice(0, 3);

                    return (
                      <div
                        key={index}
                        className="grid grid-cols-[1fr_1fr_16rem] items-center gap-3 p-2 text-sm"
                      >
                        <span className="truncate font-medium">{header}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {samples.join(' · ') || t('empty', '(empty)')}
                        </span>
                        <Select
                          value={value}
                          disabled={update.isPending}
                          onValueChange={(key) => {
                            const mapping = Object.fromEntries(
                              Object.entries(imp.mapping).filter(
                                ([column, field]) => column !== String(index) && field !== key,
                              ),
                            );

                            if (key !== IGNORE) mapping[String(index)] = key;
                            update.mutate({ mapping });
                          }}
                        >
                          <Select.Trigger
                            className={cn('h-8', value === IGNORE && 'text-muted-foreground')}
                          >
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value={IGNORE}>{t('ignore', "Don't import")}</Select.Item>
                            {columns.map((column) => (
                              <Select.Item key={column.key} value={column.key}>
                                {column.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </section>
              <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('mode', 'Rows that match an existing record')}</Label>
                  <Select
                    value={options.mode}
                    onValueChange={(mode) =>
                      update.mutate({ options: { mode: mode as ImportOptions['mode'] } })
                    }
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="create">
                        {t('mode-create', 'Skip them (create new ones only)')}
                      </Select.Item>
                      <Select.Item value="upsert">
                        {t('mode-upsert', 'Update them, create the rest')}
                      </Select.Item>
                      <Select.Item value="update">
                        {t('mode-update', 'Update them, create nothing')}
                      </Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('match-by', 'Match by')}</Label>
                  <Select
                    value={options.matchBy}
                    onValueChange={(matchBy) =>
                      update.mutate({ options: { matchBy: matchBy as ImportOptions['matchBy'] } })
                    }
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {isCompany && (
                        <Select.Item value="name">{t('match-name', 'Name')}</Select.Item>
                      )}
                      <Select.Item value="email">{t('match-email', 'Email')}</Select.Item>
                      <Select.Item value="phone">{t('match-phone', 'Phone')}</Select.Item>
                      <Select.Item value="code">{t('match-code', 'Code')}</Select.Item>
                      <Select.Item value="id">
                        {t('match-id', 'ID (from an erxes export)')}
                      </Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('add-tags', 'Add these tags to every row')}</Label>
                  <MultipleSelector
                    value={(options.tagIds ?? []).map(
                      (tagId) =>
                        tags.find((tag) => tag.value === tagId) ?? { value: tagId, label: tagId },
                    )}
                    options={tags}
                    defaultOptions={tags}
                    hidePlaceholderWhenSelected
                    onChange={(next) =>
                      update.mutate({ options: { tagIds: next.map((item) => item.value) } })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('owner', 'Owner of new records (unless the file names one)')}</Label>
                  <Select
                    value={options.ownerId ?? 'none'}
                    onValueChange={(ownerId) =>
                      update.mutate({ options: { ownerId: ownerId === 'none' ? null : ownerId } })
                    }
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="none">{t('no-owner', 'No owner')}</Select.Item>
                      {members.map((member) => (
                        <Select.Item key={member.value} value={member.value}>
                          {member.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={options.createMissing}
                    onCheckedChange={(createMissing) =>
                      update.mutate({ options: { createMissing } })
                    }
                  />
                  {isCompany
                    ? t('create-missing-tags', 'Create tags the file names but erxes lacks')
                    : t(
                        'create-missing',
                        'Create tags and companies the file names but erxes lacks',
                      )}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={options.runAutomations}
                    onCheckedChange={(runAutomations) =>
                      update.mutate({ options: { runAutomations } })
                    }
                  />
                  {t('run-automations', 'Start automations and notify owners for imported records')}
                </label>
              </section>
            </>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
