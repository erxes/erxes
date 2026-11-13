import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  IconBuilding,
  IconCurrencyDollar,
  IconUser,
} from '@tabler/icons-react';
import {
  InfoCard,
  RecordTable,
  RecordTableInlineCell,
  Spinner,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useAdjustDebtRateRemove } from '../hooks/useAdjustDebtRateChange';
import { useAdjustDebtRateDetail } from '../hooks/useAdjustDebtRateDetail';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { ADJUST_DEBT_RATE_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { useAdjustDebtRateRun } from '../hooks/useAdjustDebtRateRun';
import type {
  IAdjustDebtRate,
  IAdjustDebtRateDetail,
} from '@/adjustments/debt/types/AdjustDebtRate';
import {
  BranchBadge,
  BranchesInline,
  CompaniesInline,
  CustomerType,
  CustomersInline,
  DepartmentBadge,
  DepartmentsInline,
} from 'ui-modules';
import { ColumnDef } from '@tanstack/react-table';
import { useTransactionsDetail } from '@/transactions/transaction-form/hooks/useTransactionsDetail';
import { getTransactionNumbers } from '@/adjustments/utils/getTransactionNumbers';
import { AdjustDetailField } from '@/adjustments/components/AdjustDetailField';
import { AdjustRateDetailHeader } from '@/adjustments/components/AdjustRateDetailHeader';
import { AdjustStatusBadge } from '@/adjustments/components/AdjustStatusBadge';
import { AccountsInline } from '@/settings/account/components/AccountsInline';

const DebtRateCustomer = ({
  customerType,
  customerId,
}: Pick<IAdjustDebtRate, 'customerType' | 'customerId'>) => {
  if (!customerId) {
    return null;
  }

  if (customerType === CustomerType.CUSTOMER) {
    return <CustomersInline customerIds={[customerId]} placeholder="-" />;
  }

  if (customerType === CustomerType.COMPANY) {
    return <CompaniesInline companyIds={[customerId]} placeholder="-" />;
  }

  return customerId;
};

const formatAmount = (amount?: number) =>
  typeof amount === 'number' ? amount.toLocaleString() : '-';

const AccountCell = ({ detail }: { detail: IAdjustDebtRateDetail }) => (
  <RecordTableInlineCell>
    <div className="min-w-0">
      <div className="truncate font-medium">{detail.accountCode || '-'}</div>
      <div className="truncate text-xs text-muted-foreground">
        {[detail.accountName, detail.accountKind].filter(Boolean).join(' / ') ||
          '-'}
      </div>
    </div>
  </RecordTableInlineCell>
);

const TextCell = ({ value }: { value?: string }) => (
  <RecordTableInlineCell>{value || '-'}</RecordTableInlineCell>
);

const AmountCell = ({ amount }: { amount?: number }) => (
  <RecordTableInlineCell className="justify-end font-mono">
    {formatAmount(amount)}
  </RecordTableInlineCell>
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

const adjustDebtRateDetailColumns = (
  t: TFunction<'accounting'>,
  transactionNumbers: Map<string, string>,
): ColumnDef<IAdjustDebtRateDetail>[] => [
  {
    id: 'account',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('account')} />
    ),
    cell: ({ row }) => <AccountCell detail={row.original} />,
    size: 260,
  },
  {
    id: 'customer',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('Customer')} />
    ),
    cell: ({ row }) => (
      <TextCell
        value={[row.original.customerType, row.original.customerId]
          .filter(Boolean)
          .join(': ')}
      />
    ),
    size: 220,
  },
  {
    id: 'branch',
    header: () => (
      <RecordTable.InlineHead icon={IconBuilding} label={t('branch')} />
    ),
    cell: ({ row }) => <BranchCell branchId={row.original.branchId} />,
    size: 180,
  },
  {
    id: 'department',
    header: () => (
      <RecordTable.InlineHead icon={IconBuilding} label={t('department')} />
    ),
    cell: ({ row }) => (
      <DepartmentCell departmentId={row.original.departmentId} />
    ),
    size: 180,
  },
  {
    id: 'mainBalance',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCurrencyDollar}
        label={t('Main Balance')}
      />
    ),
    accessorKey: 'mainBalance',
    cell: ({ getValue }) => <AmountCell amount={getValue<number>()} />,
    size: 160,
  },
  {
    id: 'currencyBalance',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCurrencyDollar}
        label={t('Currency Balance')}
      />
    ),
    accessorKey: 'currencyBalance',
    cell: ({ getValue }) => <AmountCell amount={getValue<number>()} />,
    size: 180,
  },
  {
    id: 'diff',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCurrencyDollar}
        label={t('Difference')}
      />
    ),
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

export const AdjustDebtRateDetail = () => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const [id] = useQueryState<string>('id');
  const { openDetail } = useSettingsPanel(ADJUST_DEBT_RATE_CONTENT_TYPE);

  const { adjustDebtRate, loading } = useAdjustDebtRateDetail({
    variables: { _id: id ?? '' },
    skip: !id,
  });
  const { transactions = [] } = useTransactionsDetail({
    variables: { _id: adjustDebtRate?.transactionId ?? '' },
    skip: !adjustDebtRate?.transactionId,
  });
  const transactionNumbers = useMemo(
    () => getTransactionNumbers(transactions),
    [transactions],
  );

  const { removeAdjustDebtRate, loading: removeLoading } =
    useAdjustDebtRateRemove();
  const {
    calculateAdjustDebtRate,
    calculateLoading,
    runAdjustDebtRate,
    loading: runLoading,
  } = useAdjustDebtRateRun(id || '');

  if (loading) {
    return <Spinner />;
  }

  if (!id || !adjustDebtRate) {
    return <div className="p-6">{t('Adjust Debt Rate not found')}</div>;
  }

  const handleDelete = () => {
    void confirm({
      message: t('Are you sure you want to delete this adjustment?'),
    }).then(() =>
      removeAdjustDebtRate({
        variables: { adjustDebtRateIds: [id] },
      }),
    );
  };

  const handleCalculate = () => {
    calculateAdjustDebtRate();
  };

  const handleRun = () => {
    runAdjustDebtRate();
  };

  return (
    <div className="m-3 flex flex-col gap-3">
      <AdjustRateDetailHeader
        title={t('debt-rate-adjustment')}
        calculateLoading={calculateLoading}
        runLoading={runLoading}
        removeLoading={removeLoading}
        onCalculate={handleCalculate}
        onRun={handleRun}
        onEdit={() => openDetail(adjustDebtRate._id)}
        onDelete={handleDelete}
      />

      <InfoCard title={t('details')}>
        <InfoCard.Content className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4 xl:grid-cols-6">
          <AdjustDetailField
            label={t('date')}
            value={dayjs(adjustDebtRate.date).format('YYYY-MM-DD')}
          />
          <AdjustDetailField
            label={t('currency')}
            value={adjustDebtRate.currency}
          />
          <AdjustDetailField
            label={t('Spot Rate')}
            value={adjustDebtRate.spotRate?.toFixed(4) || '-'}
          />
          <AdjustDetailField
            label={t('Main Currency')}
            value={adjustDebtRate.mainCurrency}
          />
          <AdjustDetailField
            label={t('status')}
            value={
              <AdjustStatusBadge status={adjustDebtRate.status || 'draft'} />
            }
          />
          <AdjustDetailField
            label={t('customer-type')}
            value={t(adjustDebtRate.customerType || 'All')}
          />
          {adjustDebtRate.customerId && (
            <AdjustDetailField
              label={t('Customer')}
              value={
                <DebtRateCustomer
                  customerType={adjustDebtRate.customerType}
                  customerId={adjustDebtRate.customerId}
                />
              }
            />
          )}
          {adjustDebtRate.branchId && (
            <AdjustDetailField
              label={t('branch')}
              value={
                <BranchesInline
                  branchIds={[adjustDebtRate.branchId]}
                  placeholder="-"
                />
              }
            />
          )}
          {adjustDebtRate.departmentId && (
            <AdjustDetailField
              label={t('department')}
              value={
                <DepartmentsInline
                  departmentIds={[adjustDebtRate.departmentId]}
                  placeholder="-"
                />
              }
            />
          )}
          <AdjustDetailField
            label={t('Gain Account')}
            value={
              adjustDebtRate.gainAccountId && (
                <AccountsInline
                  accountIds={[adjustDebtRate.gainAccountId]}
                  permissionMode="read"
                  placeholder="-"
                />
              )
            }
          />
          <AdjustDetailField
            label={t('Loss Account')}
            value={
              adjustDebtRate.lossAccountId && (
                <AccountsInline
                  accountIds={[adjustDebtRate.lossAccountId]}
                  permissionMode="read"
                  placeholder="-"
                />
              )
            }
          />
          {adjustDebtRate.description && (
            <div className="col-span-full">
              <AdjustDetailField
                label={t('description')}
                value={adjustDebtRate.description}
              />
            </div>
          )}
        </InfoCard.Content>
      </InfoCard>

      {adjustDebtRate.error && (
        <div className="text-sm text-destructive">{adjustDebtRate.error}</div>
      )}

      {adjustDebtRate.details && adjustDebtRate.details.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">{t('Account Details')}</h3>
          <RecordTable.Provider
            columns={adjustDebtRateDetailColumns(t, transactionNumbers)}
            data={adjustDebtRate.details}
            tableId="accounting_adjust_debt_rate_detail_record_table"
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
      )}
    </div>
  );
};
