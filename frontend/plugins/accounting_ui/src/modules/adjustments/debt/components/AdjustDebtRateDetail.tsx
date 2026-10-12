import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  IconCalculator,
  IconBuilding,
  IconCurrencyDollar,
  IconPlayerPlay,
  IconTrashX,
  IconEdit,
  IconUser,
} from '@tabler/icons-react';
import {
  Button,
  RecordTable,
  RecordTableInlineCell,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { useAdjustDebtRateRemove } from '../hooks/useAdjustDebtRateChange';
import { useAdjustDebtRateDetail } from '../hooks/useAdjustDebtRateDetail';
import dayjs from 'dayjs';
import { useState } from 'react';
import { EditAdjustDebtRate } from './AdjustDebtRateForm';
import { useAdjustDebtRateRun } from '../hooks/useAdjustDebtRateRun';
import type { IAdjustDebtRateDetail } from '../types/AdjustDebtRate';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { ColumnDef } from '@tanstack/react-table';

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{value || '-'}</p>
  </div>
);

const formatAmount = (amount?: number) =>
  typeof amount === 'number' ? amount.toLocaleString() : '-';

const AccountCell = ({ detail }: { detail: IAdjustDebtRateDetail }) => (
  <RecordTableInlineCell>
    <div className="min-w-0">
      <div className="truncate font-medium">
        {detail.accountCode || detail.accountId}
      </div>
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

const adjustDebtRateDetailColumns = (
  t: TFunction<'accounting'>,
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
    cell: ({ getValue }) => <TextCell value={getValue<string>()} />,
    size: 220,
  },
];

export const AdjustDebtRateDetail = () => {
  const { t } = useTranslation('accounting');
  const [id] = useQueryState<string>('id');
  const [editOpen, setEditOpen] = useState(false);

  const { adjustDebtRate, loading } = useAdjustDebtRateDetail({
    variables: { _id: id },
    skip: !id,
  });

  const { removeAdjustDebtRate, loading: removeLoading } =
    useAdjustDebtRateRemove();
  const {
    calculateAdjustDebtRate,
    calculateLoading,
    runAdjustDebtRate,
    loading: runLoading,
  } = useAdjustDebtRateRun(id || '');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!id || !adjustDebtRate) {
    return <div className="p-6">{t('Adjust Debt Rate not found')}</div>;
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this adjustment?')) {
      removeAdjustDebtRate({
        variables: { adjustDebtRateIds: [id] },
      });
    }
  };

  const handleCalculate = () => {
    calculateAdjustDebtRate();
  };

  const handleRun = () => {
    runAdjustDebtRate();
  };

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t('debt-rate-adjustment')}</h2>
          <div className="flex gap-2">
            <Button onClick={handleCalculate} disabled={calculateLoading}>
              {calculateLoading ? <Spinner /> : <IconCalculator size={16} />}
              {t('Calculate')}
            </Button>
            <Button onClick={handleRun} disabled={runLoading}>
              {runLoading ? <Spinner /> : <IconPlayerPlay size={16} />}
              {t('run')}
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
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

        <div className="p-6 grid grid-cols-2 gap-6">
          <DetailField
            label={t('date')}
            value={dayjs(adjustDebtRate.date).format('YYYY-MM-DD')}
          />
          <DetailField label={t('currency')} value={adjustDebtRate.currency} />
          <DetailField
            label={t('Spot Rate')}
            value={adjustDebtRate.spotRate?.toFixed(4) || '-'}
          />
          <DetailField
            label={t('Main Currency')}
            value={adjustDebtRate.mainCurrency}
          />
          <DetailField
            label={t('status')}
            value={t(adjustDebtRate.status || 'draft')}
          />
          {adjustDebtRate.error && (
            <div className="col-span-2 text-sm text-destructive">
              {adjustDebtRate.error}
            </div>
          )}
          <DetailField
            label={t('customer-type')}
            value={t(adjustDebtRate.customerType || 'All')}
          />
          {adjustDebtRate.customerId && (
            <DetailField
              label={t('Customer ID')}
              value={adjustDebtRate.customerId}
            />
          )}
          {adjustDebtRate.branchId && (
            <DetailField label={t('branch')} value={adjustDebtRate.branchId} />
          )}
          {adjustDebtRate.departmentId && (
            <DetailField
              label={t('department')}
              value={adjustDebtRate.departmentId}
            />
          )}
          <DetailField
            label={t('Gain Account')}
            value={adjustDebtRate.gainAccountId}
          />
          <DetailField
            label={t('Loss Account')}
            value={adjustDebtRate.lossAccountId}
          />
          {adjustDebtRate.description && (
            <div className="col-span-2">
              <DetailField
                label={t('description')}
                value={adjustDebtRate.description}
              />
            </div>
          )}
        </div>

        {adjustDebtRate.details && adjustDebtRate.details.length > 0 && (
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold mb-4">
              {t('Account Details')}
            </h3>
            <RecordTable.Provider
              columns={adjustDebtRateDetailColumns(t)}
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

      {editOpen && (
        <EditAdjustDebtRate
          open={editOpen}
          setOpen={setEditOpen}
          adjustDebtRate={adjustDebtRate}
        />
      )}
    </div>
  );
};
