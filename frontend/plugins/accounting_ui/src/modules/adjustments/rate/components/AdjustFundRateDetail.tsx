import {
  IconCircleCheck,
  IconCalculator,
  IconClockEdit,
  IconHelpSquareRounded,
  IconPlayerPlay,
  IconRotateClockwise2,
  IconTrashX,
  IconEdit,
} from '@tabler/icons-react';
import {
  Button,
  DatePicker,
  RecordTable,
  RecordTableInlineCell,
  Spinner,
  Tabs,
  Tooltip,
  useQueryState,
} from 'erxes-ui';
import { useAdjustFundRateRemove } from '../hooks/useAdjustFundRateRemove';
import { useAdjustFundRateDetail } from '../hooks/useAdjustFundRateDetail';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import {
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
} from 'date-fns';
import { EditAdjustFundRate } from './AdjustFundRateForm';
import { useAdjustFundRateRun } from '../hooks/useAdjustFundRateRun';
import { useTransactionsDetail } from '@/transactions/transaction-form/hooks/useTransactionsDetail';
import type { ITransaction } from '@/transactions/types/Transaction';
import type {
  IAdjustFundRate,
  IAdjustFundRateDetail,
} from '../types/AdjustFundRate';
import { useAccountsInline } from '@/settings/account/hooks/useAccounts';
import type { IAccount } from '@/settings/account/types/Account';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { ColumnDef } from '@tanstack/react-table';

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="truncate text-sm font-medium">{value || '-'}</p>
  </div>
);

const formatAmount = (amount?: number) =>
  typeof amount === 'number' ? amount.toLocaleString() : '-';

const formatAccount = (account?: IAccount, fallback?: string) => {
  if (!account) {
    return fallback || '-';
  }

  return [account.code, account.name].filter(Boolean).join(' - ');
};

const isPresent = (value?: string): value is string => Boolean(value);

const makeGroupKey = (detail: IAdjustFundRateDetail) =>
  `${detail.branchId || ''}:${detail.departmentId || ''}`;

type TLinkedTransactionRow = {
  transaction: ITransaction;
  detail: ITransaction['details'][number];
};

const FundRateAccountCell = ({ detail }: { detail: IAdjustFundRateDetail }) => (
  <RecordTableInlineCell>
    <div className="min-w-0">
      <div className="truncate font-medium">
        {detail.accountCode || detail.accountId}
      </div>
      <div className="truncate text-xs text-muted-foreground">
        {detail.accountName || '-'}
      </div>
    </div>
  </RecordTableInlineCell>
);

const AmountCell = ({ amount }: { amount?: number }) => (
  <RecordTableInlineCell className="justify-end font-mono">
    {formatAmount(amount)}
  </RecordTableInlineCell>
);

const TextCell = ({ value }: { value?: string }) => (
  <RecordTableInlineCell>{value || '-'}</RecordTableInlineCell>
);

const BranchCell = ({ branchId }: { branchId?: string }) => (
  <RecordTableInlineCell>
    {branchId ? <SelectBranches.InlineCell branchIds={[branchId]} /> : '-'}
  </RecordTableInlineCell>
);

const DepartmentCell = ({ departmentId }: { departmentId?: string }) => (
  <RecordTableInlineCell>
    {departmentId ? (
      <SelectDepartments.InlineCell departmentIds={[departmentId]} />
    ) : (
      '-'
    )}
  </RecordTableInlineCell>
);

const TransactionAccountCell = ({ row }: { row: TLinkedTransactionRow }) => (
  <RecordTableInlineCell>
    <div className="min-w-0">
      <div className="truncate font-medium">
        {[row.detail.account?.code, row.detail.account?.name]
          .filter(Boolean)
          .join(' - ') ||
          row.detail.accountId ||
          '-'}
      </div>
      <div className="truncate text-xs text-muted-foreground">
        {row.transaction.journal}
      </div>
    </div>
  </RecordTableInlineCell>
);

const fundRateDetailColumns: ColumnDef<IAdjustFundRateDetail>[] = [
  {
    id: 'account',
    header: () => <RecordTable.InlineHead label="Account" />,
    cell: ({ row }) => <FundRateAccountCell detail={row.original} />,
    size: 260,
  },
  {
    id: 'mainBalance',
    header: () => <RecordTable.InlineHead label="Main Balance" />,
    accessorKey: 'mainBalance',
    cell: ({ getValue }) => <AmountCell amount={getValue<number>()} />,
    size: 160,
  },
  {
    id: 'currencyBalance',
    header: () => <RecordTable.InlineHead label="Currency Balance" />,
    accessorKey: 'currencyBalance',
    cell: ({ getValue }) => <AmountCell amount={getValue<number>()} />,
    size: 180,
  },
  {
    id: 'diff',
    header: () => <RecordTable.InlineHead label="Difference" />,
    accessorKey: 'diff',
    cell: ({ getValue }) => <AmountCell amount={getValue<number>()} />,
    size: 160,
  },
  {
    id: 'transactionId',
    header: () => <RecordTable.InlineHead label="Transaction" />,
    accessorKey: 'transactionId',
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
    size: 220,
  },
];

const linkedTransactionColumns: ColumnDef<TLinkedTransactionRow>[] = [
  {
    id: 'account',
    header: () => <RecordTable.InlineHead label="Account" />,
    cell: ({ row }) => <TransactionAccountCell row={row.original} />,
    size: 260,
  },
  {
    id: 'number',
    header: () => <RecordTable.InlineHead label="Number" />,
    cell: ({ row }) => (
      <TextCell
        value={
          row.original.transaction.number || row.original.transaction.ptrNumber
        }
      />
    ),
    size: 160,
  },
  {
    id: 'date',
    header: () => <RecordTable.InlineHead label="Date" />,
    cell: ({ row }) => (
      <TextCell
        value={
          row.original.transaction.date
            ? dayjs(row.original.transaction.date).format('YYYY-MM-DD')
            : undefined
        }
      />
    ),
    size: 140,
  },
  {
    id: 'debit',
    header: () => <RecordTable.InlineHead label="Debit" />,
    cell: ({ row }) => (
      <AmountCell
        amount={
          row.original.transaction.side === 'dt'
            ? row.original.detail.amount
            : 0
        }
      />
    ),
    size: 140,
  },
  {
    id: 'credit',
    header: () => <RecordTable.InlineHead label="Credit" />,
    cell: ({ row }) => (
      <AmountCell
        amount={
          row.original.transaction.side === 'ct'
            ? row.original.detail.amount
            : 0
        }
      />
    ),
    size: 140,
  },
  {
    id: 'branch',
    header: () => <RecordTable.InlineHead label="Branch" />,
    cell: ({ row }) => <BranchCell branchId={row.original.detail.branchId} />,
    size: 180,
  },
  {
    id: 'department',
    header: () => <RecordTable.InlineHead label="Department" />,
    cell: ({ row }) => (
      <DepartmentCell departmentId={row.original.detail.departmentId} />
    ),
    size: 180,
  },
  {
    id: 'description',
    header: () => <RecordTable.InlineHead label="Description" />,
    cell: ({ row }) => (
      <TextCell value={row.original.transaction.description} />
    ),
    size: 320,
  },
];

export const AdjustFundRateDetail = () => {
  const [id] = useQueryState<string>('id');
  const [editOpen, setEditOpen] = useState(false);

  const { adjustFundRate, loading } = useAdjustFundRateDetail({
    variables: { _id: id },
    skip: !id,
  });
  const { transactions = [], loading: transactionsLoading } =
    useTransactionsDetail({
      variables: { _id: adjustFundRate?.transactionId },
      skip: !adjustFundRate?.transactionId,
    });

  const accountIds = useMemo(
    () =>
      [adjustFundRate?.gainAccountId, adjustFundRate?.lossAccountId].filter(
        isPresent,
      ),
    [adjustFundRate?.gainAccountId, adjustFundRate?.lossAccountId],
  );

  const { accounts } = useAccountsInline({
    variables: { ids: accountIds, permissionMode: 'read' },
    skip: accountIds.length === 0,
  });

  const accountById = useMemo(
    () =>
      accounts.reduce<Record<string, IAccount>>((acc, account) => {
        acc[account._id] = account;
        return acc;
      }, {}),
    [accounts],
  );

  const { removeAdjustFundRate, loading: removeLoading } =
    useAdjustFundRateRemove();
  const {
    calculateAdjustFundRate,
    calculateLoading,
    runAdjustFundRate,
    loading: runLoading,
  } = useAdjustFundRateRun(id || '');

  const groupedDetails = useMemo(() => {
    const groups = new Map<
      string,
      {
        branchId?: string;
        departmentId?: string;
        details: IAdjustFundRateDetail[];
      }
    >();

    for (const detail of adjustFundRate?.details || []) {
      const key = makeGroupKey(detail);
      const group = groups.get(key) || {
        branchId: detail.branchId,
        departmentId: detail.departmentId,
        details: [],
      };

      group.details.push(detail);
      groups.set(key, group);
    }

    return [...groups.values()];
  }, [adjustFundRate?.details]);

  const transactionRows = useMemo(
    () =>
      transactions.flatMap((transaction) =>
        (transaction.details || []).map((detail) => ({
          transaction,
          detail,
        })),
      ),
    [transactions],
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!id || !adjustFundRate) {
    return <div className="p-6">Adjust Fund Rate not found</div>;
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this adjustment?')) {
      removeAdjustFundRate({ variables: { adjustFundRateIds: [id] } });
    }
  };

  const handleCalculate = () => {
    calculateAdjustFundRate();
  };

  const handleRun = () => {
    runAdjustFundRate();
  };

  return (
    <div className="m-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold">Fund Rate Adjustment</h3>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4 xl:grid-cols-7">
            <DetailField
              label="Date"
              value={dayjs(adjustFundRate.date).format('YYYY-MM-DD')}
            />
            <DetailField label="Currency" value={adjustFundRate.currency} />
            <DetailField
              label="Spot Rate"
              value={adjustFundRate.spotRate?.toFixed(4) || '-'}
            />
            <DetailField
              label="Main Currency"
              value={adjustFundRate.mainCurrency}
            />
            <DetailField
              label="Gain Account"
              value={formatAccount(
                accountById[adjustFundRate.gainAccountId],
                adjustFundRate.gainAccountId,
              )}
            />
            <DetailField
              label="Loss Account"
              value={formatAccount(
                accountById[adjustFundRate.lossAccountId],
                adjustFundRate.lossAccountId,
              )}
            />
            <DetailField
              label="Status"
              value={adjustFundRate.status || 'draft'}
            />
          </div>
          {adjustFundRate.description && (
            <p className="mt-2 max-w-4xl truncate text-xs text-muted-foreground">
              {adjustFundRate.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={handleCalculate} disabled={calculateLoading}>
            {calculateLoading ? <Spinner /> : <IconCalculator size={16} />}
            Calculate
          </Button>
          <Button onClick={handleRun} disabled={runLoading}>
            {runLoading ? <Spinner /> : <IconPlayerPlay size={16} />}
            Run
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <IconEdit size={16} />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-destructive"
            onClick={handleDelete}
            disabled={removeLoading}
          >
            <IconTrashX size={16} />
            Delete
          </Button>
        </div>
      </div>

      <StatusBar adjustFundRate={adjustFundRate} />
      {adjustFundRate.error && (
        <div className="text-sm text-destructive">
          {`${
            adjustFundRate.checkedAt
              ? format(
                  new Date(adjustFundRate.checkedAt),
                  'yyyy-MM-dd HH:mm:ss',
                )
              : ''
          }: ${adjustFundRate.error}`}
        </div>
      )}

      <Tabs defaultValue="calculation" className="flex flex-col gap-3">
        <Tabs.List className="w-fit">
          <Tabs.Trigger value="calculation">Calculation</Tabs.Trigger>
          <Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="calculation">
          <CalculationGroups groupedDetails={groupedDetails} />
        </Tabs.Content>
        <Tabs.Content value="transactions">
          <LinkedTransactionsTable
            loading={transactionsLoading}
            rows={transactionRows}
          />
        </Tabs.Content>
      </Tabs>

      {editOpen && (
        <EditAdjustFundRate
          open={editOpen}
          setOpen={setEditOpen}
          adjustFundRate={adjustFundRate}
        />
      )}
    </div>
  );
};

const CalculationGroups = ({
  groupedDetails,
}: {
  groupedDetails: Array<{
    branchId?: string;
    departmentId?: string;
    details: IAdjustFundRateDetail[];
  }>;
}) => {
  if (!groupedDetails.length) {
    return (
      <div className="rounded-md border p-3 text-sm text-muted-foreground">
        No calculated account balances yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groupedDetails.map((group, index) => (
        <div
          key={`${group.branchId || 'no-branch'}:${
            group.departmentId || 'no-department'
          }`}
          className="rounded-md border"
        >
          <div className="flex flex-wrap items-center gap-6 border-b bg-muted/30 px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Branch:</span>
              {group.branchId ? (
                <SelectBranches.InlineCell branchIds={[group.branchId]} />
              ) : (
                <span>-</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Department:</span>
              {group.departmentId ? (
                <SelectDepartments.InlineCell
                  departmentIds={[group.departmentId]}
                />
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
          <RecordTable.Provider
            columns={fundRateDetailColumns}
            data={group.details}
            tableId={`accounting_adjust_fund_rate_detail_group_${index}`}
          >
            <RecordTable.Scroll>
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.RowList />
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.Scroll>
          </RecordTable.Provider>
        </div>
      ))}
    </div>
  );
};

const LinkedTransactionsTable = ({
  loading,
  rows,
}: {
  loading: boolean;
  rows: TLinkedTransactionRow[];
}) => {
  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center rounded-md border">
        <Spinner />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-md border p-3 text-sm text-muted-foreground">
        No linked transactions yet.
      </div>
    );
  }

  return (
    <RecordTable.Provider
      columns={linkedTransactionColumns}
      data={rows}
      tableId="accounting_adjust_fund_rate_linked_transactions"
      className="rounded-md border"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};

const StatusBar = ({ adjustFundRate }: { adjustFundRate: IAdjustFundRate }) => {
  const start = adjustFundRate.beginDate || adjustFundRate.date;
  const end = adjustFundRate.date;
  const current = adjustFundRate.successDate || start;

  if (!start || !end) {
    return null;
  }

  const days = eachDayOfInterval({
    start: new Date(start),
    end: new Date(end),
  });

  const renderIcon = (day: Date) => {
    if (isSameDay(day, new Date(current))) {
      if (adjustFundRate.status === 'draft') {
        return <IconHelpSquareRounded className="h-5 w-5 text-blue-400" />;
      }

      if (adjustFundRate.status === 'process' && adjustFundRate.error) {
        return <IconClockEdit className="h-5 w-5 text-orange-500" />;
      }

      if (adjustFundRate.status === 'process') {
        return <IconRotateClockwise2 className="h-5 w-5 text-yellow-500" />;
      }

      return <IconCircleCheck className="h-5 w-5 text-green-500" />;
    }

    if (isBefore(day, new Date(current))) {
      return <IconCircleCheck className="h-5 w-5 text-green-500" />;
    }

    if (isAfter(day, new Date(current))) {
      return <IconHelpSquareRounded className="h-5 w-5 text-blue-400" />;
    }

    return undefined;
  };

  return (
    <div className="flex flex-wrap items-center justify-start gap-2 max-w-full">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-primary font-bold">
          <DatePicker
            value={new Date(start)}
            onChange={() => null}
            className="flex h-8 w-full"
            disabled
          />
        </span>
        <span className="text-accent-foreground">{'->'}</span>
      </div>
      {days.map((day) => (
        <Tooltip key={day.toString()} delayDuration={0}>
          <Tooltip.Trigger asChild>{renderIcon(day)}</Tooltip.Trigger>
          <Tooltip.Content sideOffset={12}>
            <span>{format(day, 'yyyy-MM-dd (EEE)')}</span>
          </Tooltip.Content>
        </Tooltip>
      ))}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-accent-foreground">{'->'}</span>
        <span className="text-primary font-bold">
          <DatePicker
            value={new Date(end)}
            onChange={() => null}
            className="flex h-8 w-full"
            disabled
          />
        </span>
      </div>
    </div>
  );
};
