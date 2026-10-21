import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import dayjs from 'dayjs';
import {
  IconEdit,
  IconPlayerPlay,
  IconPlus,
  IconReceipt,
  IconTrash,
  IconArrowBackUp,
} from '@tabler/icons-react';
import {
  Button,
  Command,
  Combobox,
  PageSubHeader,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import {
  BranchesInline,
  Can,
  DepartmentsInline,
  usePermissionCheck,
} from 'ui-modules';
import { AccountsInline } from '@/settings/account/components/AccountsInline';
import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingSheet } from '@/layout/components/Sheet';
import { SettingsRowsTable } from '@/settings/components/SettingsRowsTable';
import { JobListStatus } from '@/settings/jobs/components/JobListStatus';
import { JobExecutionEditor } from '@/inventories/job-executions/JobExecutionEditor';
import { JobExecutionFilters } from '@/inventories/job-executions/JobExecutionFilters';
import { useJobExecutionFilters } from '@/inventories/job-executions/useJobExecutionFilters';
import { GET_EXECUTIONS } from '@/inventories/job-executions/graphql';
import { useExecutionActions } from '@/inventories/job-executions/useExecutionActions';
import { ExecutionCommandbar } from '@/inventories/job-executions/ExecutionCommandbar';
import { JOB_EXECUTION_COLUMN_ORDER } from '@/inventories/job-executions/tableDefaults';
import { JobExecution } from '@/inventories/job-executions/types';

const ExecutionActions = ({
  execution,
  edit,
}: {
  execution: JobExecution;
  edit: () => void;
}) => {
  const { t } = useTranslation('accounting');
  const { hasActionPermission } = usePermissionCheck();
  const canManage = hasActionPermission('manageJobExecutions');
  const { canRun, run, loading } = useExecutionActions();
  const busy = loading || ['posting', 'undoing'].includes(execution.status);
  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton
          className="w-full h-full"
          disabled={busy}
          aria-label={t('production-actions')}
        />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item onSelect={edit}>
              <IconEdit />
              {t(
                ['draft', 'posted'].includes(execution.status) && canManage
                  ? 'edit'
                  : 'production-view',
              )}
            </Command.Item>
            {canRun('post', [execution]) && (
              <Command.Item onSelect={() => void run('post', [execution])}>
                <IconPlayerPlay />
                {t('production-post')}
              </Command.Item>
            )}
            {canRun('undo', [execution]) && (
              <Command.Item onSelect={() => void run('undo', [execution])}>
                <IconArrowBackUp />
                {t('production-undo')}
              </Command.Item>
            )}
            {execution.parentId && (
              <Command.Item asChild>
                <Link
                  to={`/accounting/transaction/edit?parentId=${encodeURIComponent(
                    execution.parentId,
                  )}`}
                >
                  <IconReceipt />
                  {t('transactions')}
                </Link>
              </Command.Item>
            )}
            {canRun('remove', [execution]) && (
              <Command.Item onSelect={() => void run('remove', [execution])}>
                <IconTrash />
                {t('delete')}
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const JobExecutionsPage = () => {
  const { t, i18n } = useTranslation('accounting');
  const isMongolian = (i18n.resolvedLanguage ?? i18n.language).startsWith('mn');
  const sideLabels = {
    input: t('inputs', { defaultValue: isMongolian ? 'Орц' : 'Inputs' }),
    output: t('outputs', { defaultValue: isMongolian ? 'Гарц' : 'Outputs' }),
  };
  const filters = useJobExecutionFilters();
  const [editor, setEditor] = useState<JobExecution | 'new' | null>(null);
  const { data, loading, error, refetch, fetchMore } = useQuery(
    GET_EXECUTIONS,
    {
      variables: {
        ...filters,
        page: 1,
        perPage: 20,
      },
      notifyOnNetworkStatusChange: true,
    },
  );
  const rows = data?.jobExecutions.rows ?? [];
  const totalCount = data?.jobExecutions.totalCount ?? 0;
  const columns: ColumnDef<JobExecution>[] = [
    {
      id: 'more',
      size: 33,
      header: () => <RecordTable.ColumnSelector />,
      cell: ({ row }) => (
        <ExecutionActions
          execution={row.original}
          edit={() => setEditor(row.original)}
        />
      ),
    },
    RecordTable.checkboxColumn as ColumnDef<JobExecution>,
    {
      id: 'date',
      header: () => <RecordTable.InlineHead label={t('date')} />,
      size: 170,
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {dayjs(row.original.date).format('YYYY-MM-DD HH:mm')}
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'jobName',
      header: () => <RecordTable.InlineHead label={t('production-job')} />,
      size: 260,
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {row.original.jobs.map((job) => job.jobName || job.jobId).join(', ')}
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'quantity',
      header: () => <RecordTable.InlineHead label={t('production-quantity')} />,
      size: 170,
      minSize: 170,
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {row.original.jobs
            .map((job) => job.quantity.toLocaleString())
            .join(' | ')}
        </RecordTableInlineCell>
      ),
    },
    ...(['input', 'output'] as const).flatMap<ColumnDef<JobExecution>>(
      (side) => [
        {
          id: `${side}AccountId`,
          accessorKey: `${side}AccountId`,
          header: () => (
            <RecordTable.InlineHead
              label={`${sideLabels[side]}: ${t('account')}`}
            />
          ),
          size: 240,
          cell: ({ row }) => (
            <RecordTableInlineCell>
              <AccountsInline
                accountIds={[row.original[`${side}AccountId`]]}
                permissionMode="read"
              />
            </RecordTableInlineCell>
          ),
        },
        {
          id: `${side}BranchId`,
          accessorKey: `${side}BranchId`,
          header: () => (
            <RecordTable.InlineHead
              label={`${sideLabels[side]}: ${t('branch')}`}
            />
          ),
          size: 200,
          cell: ({ row }) => (
            <RecordTableInlineCell>
              <BranchesInline
                branchIds={[row.original[`${side}BranchId`]].filter(
                  (id): id is string => Boolean(id),
                )}
                placeholder="-"
              />
            </RecordTableInlineCell>
          ),
        },
        {
          id: `${side}DepartmentId`,
          accessorKey: `${side}DepartmentId`,
          header: () => (
            <RecordTable.InlineHead
              label={`${sideLabels[side]}: ${t('department')}`}
            />
          ),
          size: 200,
          cell: ({ row }) => (
            <RecordTableInlineCell>
              <DepartmentsInline
                departmentIds={[row.original[`${side}DepartmentId`]].filter(
                  (id): id is string => Boolean(id),
                )}
                placeholder="-"
              />
            </RecordTableInlineCell>
          ),
        },
      ],
    ),
    {
      id: 'status',
      header: () => <RecordTable.InlineHead label={t('status')} />,
      size: 150,
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {t(`production-status-${row.original.status}`)}
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'description',
      header: () => <RecordTable.InlineHead label={t('description')} />,
      size: 250,
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {row.original.description || '-'}
        </RecordTableInlineCell>
      ),
    },
  ];
  columns.sort(
    (left, right) =>
      JOB_EXECUTION_COLUMN_ORDER.indexOf(left.id ?? '') -
      JOB_EXECUTION_COLUMN_ORDER.indexOf(right.id ?? ''),
  );
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/inventories/job-executions"
        returnText={t('production-executions')}
        skipSettings
      >
        <Can action="manageJobExecutions">
          <Button onClick={() => setEditor('new')}>
            <IconPlus />
            {t('production-add')}
          </Button>
        </Can>
      </AccountingHeader>
      <PageSubHeader>
        <JobExecutionFilters />
      </PageSubHeader>
      {error || (!loading && !rows.length) ? (
        <JobListStatus error={error} retry={() => void refetch()} />
      ) : (
        <SettingsRowsTable
          columns={columns}
          data={rows}
          loading={loading}
          totalCount={totalCount}
          tableId="accounting_job_executions"
          className="m-3"
          Commandbar={ExecutionCommandbar}
          stickyColumns={['more']}
          handleFetchMore={() => {
            if (loading || rows.length >= totalCount) return;
            void fetchMore({
              variables: { page: Math.ceil(rows.length / 20) + 1 },
              updateQuery: (previous, { fetchMoreResult }) => ({
                jobExecutions: {
                  ...fetchMoreResult.jobExecutions,
                  rows: [
                    ...previous.jobExecutions.rows,
                    ...fetchMoreResult.jobExecutions.rows,
                  ],
                },
              }),
            });
          }}
        />
      )}
      <Sheet
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <AccountingSheet
          title={t('production-executions')}
          className="sm:max-w-5xl"
        >
          {editor && (
            <JobExecutionEditor
              key={editor === 'new' ? 'new' : editor._id}
              execution={editor === 'new' ? undefined : editor}
              onSaved={() => setEditor(null)}
            />
          )}
        </AccountingSheet>
      </Sheet>
    </AccountingLayout>
  );
};
