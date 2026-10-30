import { createContext, useContext, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import dayjs from 'dayjs';
import {
  IconEdit,
  IconPlayerPlay,
  IconReceipt,
  IconTrash,
  IconArrowBackUp,
} from '@tabler/icons-react';
import {
  Command,
  Combobox,
  Popover,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import type {
  CellContext,
  ColumnDef,
  HeaderContext,
} from '@tanstack/react-table';
import {
  BranchesInline,
  DepartmentsInline,
  usePermissionCheck,
} from 'ui-modules';
import { AccountsInline } from '@/settings/account/components/AccountsInline';
import { useExecutionActions } from '@/inventories/job-executions/useExecutionActions';
import { JOB_EXECUTION_COLUMN_ORDER } from '@/inventories/job-executions/tableDefaults';
import { JobExecution } from '@/inventories/job-executions/types';

const ExecutionEditContext = createContext<
  ((execution: JobExecution) => void) | undefined
>(undefined);

export const ExecutionTableProvider = ({
  onEdit,
  children,
}: {
  onEdit: (execution: JobExecution) => void;
  children: ReactNode;
}) => (
  <ExecutionEditContext.Provider value={onEdit}>
    {children}
  </ExecutionEditContext.Provider>
);

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

const ExecutionActionsCell = ({ row }: CellContext<JobExecution, unknown>) => {
  const edit = useContext(ExecutionEditContext);
  if (!edit) throw new Error('ExecutionTableProvider is required');
  return (
    <ExecutionActions
      execution={row.original}
      edit={() => edit(row.original)}
    />
  );
};

const ExecutionColumnSelector = () => <RecordTable.ColumnSelector />;

const sideColumns = (['input', 'output'] as const).flatMap((side) => [
  {
    id: side + 'AccountId',
    side,
    label: 'account',
    size: 240,
    cell: ExecutionAccountCell,
  },
  {
    id: side + 'BranchId',
    side,
    label: 'branch',
    size: 200,
    cell: ExecutionBranchCell,
  },
  {
    id: side + 'DepartmentId',
    side,
    label: 'department',
    size: 200,
    cell: ExecutionDepartmentCell,
  },
]);

const ExecutionColumnHeader = ({
  column,
}: HeaderContext<JobExecution, unknown>) => {
  const { t, i18n } = useTranslation('accounting');
  const sideColumn = sideColumns.find((item) => item.id === column.id);
  if (sideColumn) {
    const isMongolian = (i18n.resolvedLanguage ?? i18n.language).startsWith(
      'mn',
    );
    const defaults = isMongolian
      ? { input: 'Орц', output: 'Гарц' }
      : { input: 'Inputs', output: 'Outputs' };
    const label = [
      t(sideColumn.side + 's', { defaultValue: defaults[sideColumn.side] }),
      t(sideColumn.label),
    ].join(': ');
    return <RecordTable.InlineHead label={label} />;
  }
  const labels: Record<string, string> = {
    date: 'date',
    jobName: 'production-job',
    quantity: 'production-quantity',
    status: 'status',
    description: 'description',
  };
  return <RecordTable.InlineHead label={t(labels[column.id])} />;
};

const ExecutionDateCell = ({ row }: CellContext<JobExecution, unknown>) => (
  <RecordTableInlineCell>
    {dayjs(row.original.date).format('YYYY-MM-DD HH:mm')}
  </RecordTableInlineCell>
);
const ExecutionNameCell = ({ row }: CellContext<JobExecution, unknown>) => (
  <RecordTableInlineCell>
    {row.original.jobs.map((job) => job.jobName || job.jobId).join(', ')}
  </RecordTableInlineCell>
);
const ExecutionQuantityCell = ({ row }: CellContext<JobExecution, unknown>) => (
  <RecordTableInlineCell>
    {row.original.jobs.map((job) => job.quantity.toLocaleString()).join(' | ')}
  </RecordTableInlineCell>
);
function ExecutionAccountCell({ cell }: CellContext<JobExecution, unknown>) {
  return (
    <RecordTableInlineCell>
      <AccountsInline
        accountIds={[cell.getValue<string>()]}
        permissionMode="read"
      />
    </RecordTableInlineCell>
  );
}
function ExecutionBranchCell({ cell }: CellContext<JobExecution, unknown>) {
  const id = cell.getValue<string | undefined>();
  return (
    <RecordTableInlineCell>
      <BranchesInline branchIds={id ? [id] : []} placeholder="-" />
    </RecordTableInlineCell>
  );
}
function ExecutionDepartmentCell({ cell }: CellContext<JobExecution, unknown>) {
  const id = cell.getValue<string | undefined>();
  return (
    <RecordTableInlineCell>
      <DepartmentsInline departmentIds={id ? [id] : []} placeholder="-" />
    </RecordTableInlineCell>
  );
}
const ExecutionStatusCell = ({ row }: CellContext<JobExecution, unknown>) => {
  const { t } = useTranslation('accounting');
  return (
    <RecordTableInlineCell>
      {t('production-status-' + row.original.status)}
    </RecordTableInlineCell>
  );
};
const ExecutionDescriptionCell = ({
  row,
}: CellContext<JobExecution, unknown>) => (
  <RecordTableInlineCell>
    {row.original.description || '-'}
  </RecordTableInlineCell>
);

export const jobExecutionColumns: ColumnDef<JobExecution>[] = [
  {
    id: 'more',
    size: 33,
    header: ExecutionColumnSelector,
    cell: ExecutionActionsCell,
  },
  RecordTable.checkboxColumn as ColumnDef<JobExecution>,
  {
    id: 'date',
    header: ExecutionColumnHeader,
    size: 170,
    cell: ExecutionDateCell,
  },
  {
    id: 'jobName',
    header: ExecutionColumnHeader,
    size: 260,
    cell: ExecutionNameCell,
  },
  {
    id: 'quantity',
    header: ExecutionColumnHeader,
    size: 170,
    minSize: 170,
    cell: ExecutionQuantityCell,
  },
  ...sideColumns.map(({ id, size, cell }) => ({
    id,
    accessorKey: id,
    size,
    header: ExecutionColumnHeader,
    cell,
  })),
  {
    id: 'status',
    header: ExecutionColumnHeader,
    size: 150,
    cell: ExecutionStatusCell,
  },
  {
    id: 'description',
    header: ExecutionColumnHeader,
    size: 250,
    cell: ExecutionDescriptionCell,
  },
];
jobExecutionColumns.sort(
  (left, right) =>
    JOB_EXECUTION_COLUMN_ORDER.indexOf(left.id ?? '') -
    JOB_EXECUTION_COLUMN_ORDER.indexOf(right.id ?? ''),
);
