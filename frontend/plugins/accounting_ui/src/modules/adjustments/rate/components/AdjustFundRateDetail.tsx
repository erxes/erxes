import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
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
  InfoCard,
  RecordTable,
  RecordTableInlineCell,
  Spinner,
  Tabs,
  Tooltip,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useAdjustFundRateRemove } from '../hooks/useAdjustFundRateRemove';
import { useAdjustFundRateDetail } from '../hooks/useAdjustFundRateDetail';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { eachDayOfInterval, isAfter, isBefore, isSameDay } from 'date-fns';
import { formatDate as format } from '@/utils/graphqlDate';
import { ADJUST_FUND_RATE_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { useAdjustFundRateRun } from '../hooks/useAdjustFundRateRun';
import { useTransactionsDetail } from '@/transactions/transaction-form/hooks/useTransactionsDetail';
import type { ITransaction } from '@/transactions/types/Transaction';
import { getTransactionNumbers } from '@/adjustments/utils/getTransactionNumbers';
import type {
  IAdjustFundRate,
  IAdjustFundRateDetail,
} from '../types/AdjustFundRate';
import { useAccountsInline } from '@/settings/account/hooks/useAccounts';
import type { IAccount } from '@/settings/account/types/Account';
import { BranchBadge, DepartmentBadge } from 'ui-modules';
import { ColumnDef } from '@tanstack/react-table';
import { AdjustDetailField } from '@/adjustments/components/AdjustDetailField';
import { AdjustStatusBadge } from '@/adjustments/components/AdjustStatusBadge';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';

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
      <div className="truncate font-medium">{detail.accountCode || '-'}</div>
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
    {branchId ? <BranchBadge branchId={branchId} renderAsPlainText /> : '-'}
  </RecordTableInlineCell>
);

const DepartmentCell = ({ departmentId }: { departmentId?: string }) => (
  <RecordTableInlineCell>
    {departmentId ? (
      <DepartmentBadge departmentId={departmentId} renderAsPlainText />
    ) : (
      '-'
    )}
  </RecordTableInlineCell>
);

const TransactionAccountCell = ({ row }: { row: TLinkedTransactionRow }) => {
  const { t } = useTranslation('accounting');
  return (
    <RecordTableInlineCell>
      <div className="min-w-0">
        <div className="truncate font-medium">
          {[row.detail.account?.code, row.detail.account?.name]
            .filter(Boolean)
            .join(' - ') || '-'}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {row.transaction.journal ? t(row.transaction.journal) : '-'}
        </div>
      </div>
    </RecordTableInlineCell>
  );
};

const fundRateDetailColumns = (
  t: TFunction<'accounting'>,
  transactionNumbers: Map<string, string>,
): ColumnDef<IAdjustFundRateDetail>[] => [
  {
    id: 'account',
    header: () => <RecordTable.InlineHead label={t('account')} />,
    cell: ({ row }) => <FundRateAccountCell detail={row.original} />,
    size: 260,
  },
  {
    id: 'mainBalance',
    header: () => <RecordTable.InlineHead label={t('Main Balance')} />,
    accessorKey: 'mainBalance',
    cell: ({ getValue }) => <AmountCell amount={getValue<number>()} />,
    size: 160,
  },
  {
    id: 'currencyBalance',
    header: () => <RecordTable.InlineHead label={t('Currency Balance')} />,
    accessorKey: 'currencyBalance',
    cell: ({ getValue }) => <AmountCell amount={getValue<number>()} />,
    size: 180,
  },
  {
    id: 'diff',
    header: () => <RecordTable.InlineHead label={t('Difference')} />,
    accessorKey: 'diff',
    cell: ({ getValue }) => <AmountCell amount={getValue<number>()} />,
    size: 160,
  },
  {
    id: 'transactionId',
    header: () => <RecordTable.InlineHead label={t('transaction')} />,
    accessorKey: 'transactionId',
    cell: ({ getValue }) => (
      <TextCell value={transactionNumbers.get(getValue<string>())} />
    ),
    size: 220,
  },
];

const linkedTransactionColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<TLinkedTransactionRow>[] => [
  {
    id: 'account',
    header: () => <RecordTable.InlineHead label={t('account')} />,
    cell: ({ row }) => <TransactionAccountCell row={row.original} />,
    size: 260,
  },
  {
    id: 'number',
    header: () => <RecordTable.InlineHead label={t('number')} />,
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
    header: () => <RecordTable.InlineHead label={t('date')} />,
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
    header: () => <RecordTable.InlineHead label={t('debit')} />,
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
    header: () => <RecordTable.InlineHead label={t('credit')} />,
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
    header: () => <RecordTable.InlineHead label={t('branch')} />,
    cell: ({ row }) => <BranchCell branchId={row.original.detail.branchId} />,
    size: 180,
  },
  {
    id: 'department',
    header: () => <RecordTable.InlineHead label={t('department')} />,
    cell: ({ row }) => (
      <DepartmentCell departmentId={row.original.detail.departmentId} />
    ),
    size: 180,
  },
  {
    id: 'description',
    header: () => <RecordTable.InlineHead label={t('description')} />,
    cell: ({ row }) => (
      <TextCell value={row.original.transaction.description} />
    ),
    size: 320,
  },
];

export const AdjustFundRateDetail = () => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const [id] = useQueryState<string>('id');
  const { openDetail } = useSettingsPanel(ADJUST_FUND_RATE_CONTENT_TYPE);

  const { adjustFundRate, loading } = useAdjustFundRateDetail({
    variables: { _id: id ?? '' },
    skip: !id,
  });
  const { transactions = [], loading: transactionsLoading } =
    useTransactionsDetail({
      variables: { _id: adjustFundRate?.transactionId ?? '' },
      skip: !adjustFundRate?.transactionId,
    });

  const transactionNumbers = useMemo(
    () => getTransactionNumbers(transactions),
    [transactions],
  );

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
    return <Spinner />;
  }

  if (!id || !adjustFundRate) {
    return <div className="p-6">{t('Adjust Fund Rate not found')}</div>;
  }

  const handleDelete = () => {
    void confirm({
      message: t('Are you sure you want to delete this adjustment?'),
    }).then(() =>
      removeAdjustFundRate({ variables: { adjustFundRateIds: [id] } }),
    );
  };

  const handleCalculate = () => {
    calculateAdjustFundRate();
  };

  const handleRun = () => {
    runAdjustFundRate();
  };

  return (
    <div className="m-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">{t('fund-rate-adjustment')}</h3>
        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={handleCalculate} disabled={calculateLoading}>
            {calculateLoading ? <Spinner /> : <IconCalculator size={16} />}
            {t('Calculate')}
          </Button>
          <Button onClick={handleRun} disabled={runLoading}>
            {runLoading ? <Spinner /> : <IconPlayerPlay size={16} />}
            {t('run')}
          </Button>
          <Button
            variant="outline"
            onClick={() => openDetail(adjustFundRate._id)}
          >
            <IconEdit size={16} />
            {t('edit')}
          </Button>
          <Button
            variant="outline"
            className="text-destructive"
            onClick={handleDelete}
            disabled={removeLoading}
          >
            <IconTrashX size={16} />
            {t('delete')}
          </Button>
        </div>
      </div>

      <InfoCard title={t('details')}>
        <InfoCard.Content className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4 xl:grid-cols-6">
          <AdjustDetailField
            label={t('date')}
            value={dayjs(adjustFundRate.date).format('YYYY-MM-DD')}
          />
          <AdjustDetailField
            label={t('currency')}
            value={adjustFundRate.currency}
          />
          <AdjustDetailField
            label={t('Spot Rate')}
            value={adjustFundRate.spotRate?.toFixed(4) || '-'}
          />
          <AdjustDetailField
            label={t('Main Currency')}
            value={adjustFundRate.mainCurrency}
          />
          <AdjustDetailField
            label={t('status')}
            value={
              <AdjustStatusBadge status={adjustFundRate.status || 'draft'} />
            }
          />
          <AdjustDetailField
            label={t('Gain Account')}
            value={formatAccount(
              accountById[adjustFundRate.gainAccountId ?? ''],
              adjustFundRate.gainAccountId,
            )}
          />
          <AdjustDetailField
            label={t('Loss Account')}
            value={formatAccount(
              accountById[adjustFundRate.lossAccountId ?? ''],
              adjustFundRate.lossAccountId,
            )}
          />
          {adjustFundRate.description && (
            <div className="col-span-full">
              <AdjustDetailField
                label={t('description')}
                value={adjustFundRate.description}
              />
            </div>
          )}
        </InfoCard.Content>
      </InfoCard>

      <StatusBar adjustFundRate={adjustFundRate} />
      {adjustFundRate.error && (
        <div className="text-sm text-destructive">
          {`${
            adjustFundRate.checkedAt
              ? format(
                  new Date(adjustFundRate.checkedAt ?? Date.now()),
                  'yyyy-MM-dd HH:mm:ss',
                )
              : ''
          }: ${adjustFundRate.error}`}
        </div>
      )}

      <Tabs defaultValue="calculation" className="flex flex-col gap-3">
        <Tabs.List className="w-fit">
          <Tabs.Trigger value="calculation">{t('Calculation')}</Tabs.Trigger>
          <Tabs.Trigger value="transactions">{t('transactions')}</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="calculation">
          <CalculationGroups
            groupedDetails={groupedDetails}
            transactionNumbers={transactionNumbers}
          />
        </Tabs.Content>
        <Tabs.Content value="transactions">
          <LinkedTransactionsTable
            loading={transactionsLoading}
            rows={transactionRows}
          />
        </Tabs.Content>
      </Tabs>
    </div>
  );
};

const CalculationGroups = ({
  groupedDetails,
  transactionNumbers,
}: {
  groupedDetails: Array<{
    branchId?: string;
    departmentId?: string;
    details: IAdjustFundRateDetail[];
  }>;
  transactionNumbers: Map<string, string>;
}) => {
  const { t } = useTranslation('accounting');
  if (!groupedDetails.length) {
    return (
      <AccountingEmptyState
        description={t('No calculated account balances yet.')}
        className="m-0"
      />
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
              <span className="text-muted-foreground">
                {t('Branch:', { nsSeparator: false })}
              </span>
              {group.branchId ? (
                <BranchBadge branchId={group.branchId} renderAsPlainText />
              ) : (
                <span>-</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {t('Department:', { nsSeparator: false })}
              </span>
              {group.departmentId ? (
                <DepartmentBadge
                  departmentId={group.departmentId}
                  renderAsPlainText
                />
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
          <RecordTable.Provider
            columns={fundRateDetailColumns(t, transactionNumbers)}
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
  const { t } = useTranslation('accounting');

  if (!loading && !rows.length) {
    return (
      <AccountingEmptyState
        description={t('No linked transactions yet.')}
        className="m-0"
      />
    );
  }

  return (
    <RecordTable.Provider
      columns={linkedTransactionColumns(t)}
      data={loading ? [] : rows}
      tableId="accounting_adjust_fund_rate_linked_transactions"
      className="rounded-md border"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={4} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};

const StatusBar = ({ adjustFundRate }: { adjustFundRate: IAdjustFundRate }) => {
  const start = adjustFundRate.beginDate || adjustFundRate.date;
  const end = adjustFundRate.date;

  if (!start || !end) {
    return null;
  }

  const current = adjustFundRate.successDate || start;
  const days = eachDayOfInterval({
    start: new Date(start),
    end: new Date(end),
  });

  const renderIcon = (day: Date) => {
    if (isSameDay(day, new Date(current))) {
      if (adjustFundRate.status === 'draft') {
        return (
          <IconHelpSquareRounded className="h-5 w-5 text-muted-foreground" />
        );
      }

      if (adjustFundRate.status === 'process' && adjustFundRate.error) {
        return <IconClockEdit className="h-5 w-5 text-warning" />;
      }

      if (adjustFundRate.status === 'process') {
        return <IconRotateClockwise2 className="h-5 w-5 text-info" />;
      }

      return <IconCircleCheck className="h-5 w-5 text-success" />;
    }

    if (isBefore(day, new Date(current))) {
      return <IconCircleCheck className="h-5 w-5 text-success" />;
    }

    if (isAfter(day, new Date(current))) {
      return (
        <IconHelpSquareRounded className="h-5 w-5 text-muted-foreground" />
      );
    }

    return undefined;
  };

  return (
    <div className="flex flex-wrap items-center justify-start gap-2 max-w-full">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{format(start, 'yyyy-MM-dd')}</span>
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
        <span className="font-medium">{format(end, 'yyyy-MM-dd')}</span>
      </div>
    </div>
  );
};
