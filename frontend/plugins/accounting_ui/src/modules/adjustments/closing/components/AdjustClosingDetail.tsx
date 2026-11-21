import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  IconBinoculars,
  IconCalculator,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconClockEdit,
  IconEdit,
  IconEraser,
  IconGavel,
  IconHelpSquareRounded,
  IconLockOpen,
  IconPlayerPlay,
  IconRefresh,
  IconRotateClockwise2,
  IconTrashX,
} from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { eachDayOfInterval, isAfter, isBefore, isSameDay } from 'date-fns';
import { formatDate as format } from '@/utils/graphqlDate';
import {
  Button,
  DatePicker,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Spinner,
  Tabs,
  TextOverflowTooltip,
  Tooltip,
  useConfirm,
} from 'erxes-ui';
import { useCallback, useMemo, useState } from 'react';
import {
  IDepartment,
  IBranch,
  useBranchesMain,
  useDepartmentsMain,
} from 'ui-modules';
import { AccountsInline } from '~/modules/settings/account/components/AccountsInline';
import { TBalanceTableRow } from '~/modules/transactions/transaction-form/components/TBalanceTableRow';
import { tbalanceColumns } from '~/modules/transactions/transaction-form/components/TBalanceTableColumns';
import { useTransactionsDetail } from '~/modules/transactions/transaction-form/hooks/useTransactionsDetail';
import { ITBalanceTransaction } from '~/modules/transactions/transaction-form/types/TBalance';
import { ITransaction } from '~/modules/transactions/types/Transaction';
import { getTransactionNumbers } from '@/adjustments/utils/getTransactionNumbers';
import {
  ADJ_CLOSING_STATUSES,
  IAdjustClosing,
  IAdjustClosingDetailItem,
} from '~/modules/adjustments/closing/types/AdjustClosing';
import { ADJ_INV_STATUSES } from '~/modules/adjustments/inventories/types/AdjustInventory';
import { useAdjustClosingRun } from '../hooks/useAdjustClosingRun';
import {
  useAdjustClosingDetail,
  useAdjustClosingDetails,
} from '../hooks/useAdjustClosingDetail';
import { useAdjustClosingPublish } from '../hooks/useAdjustClosingPublish';
import { useAdjustClosingEntryRemove } from '../hooks/useAdjustClosingRemove';
import { useAdjustClosingCancel } from '../hooks/useAdjustClosingCancel';
import { notifyMutationResult } from '@/utils/graphqlMutation';
import { useAdjustClosingEdit } from '../hooks/useAdjustClosingEdit';
import { ADJUST_CLOSING_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

interface AdjustClosingDetailProps {
  id?: string;
}

type TClosingEntryRow = {
  _id: string;
  detailId: string;
  accountId: string;
  balance: number;
  percent?: number;
  mainAccTrId?: string;
  integrateTrId?: string;
};

type TStructureLabelMap = Record<
  string,
  { _id?: string; code?: string; title?: string; order?: string }
>;

type TPercentChangeHandler = (
  detailId: string,
  entryId: string,
  value: string,
) => void;

const formatAmount = (amount?: number) =>
  typeof amount === 'number' ? amount.toLocaleString() : '-';

const formatStructureLabel = (
  id: string | undefined,
  labelMap: TStructureLabelMap,
) => {
  if (!id) {
    return '-';
  }

  const label = labelMap[id];
  if (!label) {
    return '-';
  }

  return [label.code, label.title].filter(Boolean).join(' - ') || '-';
};

const getBranchLabel = (
  id: string | undefined,
  labelMap: TStructureLabelMap,
): IBranch | undefined => {
  if (!id || !labelMap[id]) {
    return undefined;
  }

  return {
    _id: id,
    code: labelMap[id].code || '',
    title: labelMap[id].title || '',
    order: labelMap[id].order || '',
  };
};

const getDepartmentLabel = (
  id: string | undefined,
  labelMap: TStructureLabelMap,
): IDepartment | undefined => {
  if (!id || !labelMap[id]) {
    return undefined;
  }

  return {
    _id: id,
    code: labelMap[id].code || '',
    title: labelMap[id].title || '',
    order: labelMap[id].order,
  };
};

const groupRowsByPointer = (rows: ITBalanceTransaction[]) => {
  const rowsByPointer = new Map<string, ITBalanceTransaction[]>();

  for (const row of rows) {
    const pointer = row.ptrId || '';
    const group = rowsByPointer.get(pointer);

    if (group) group.push(row);
    else rowsByPointer.set(pointer, [row]);
  }

  return [...rowsByPointer.values()].flat();
};

const makeLinkedTransactionRows = (
  transactions: ITransaction[],
  branchMap: TStructureLabelMap,
  departmentMap: TStructureLabelMap,
): ITBalanceTransaction[] =>
  groupRowsByPointer(
    transactions.flatMap((transaction, transactionIndex) =>
      (transaction.details || []).map((detail) => ({
        ...transaction,
        _id: `${transaction._id || transaction.parentId || transactionIndex}:${
          detail._id || detail.accountId || transactionIndex
        }`,
        date: new Date(transaction.date || new Date()),
        number: transaction.number || transaction.ptrNumber,
        detail,
        branch:
          transaction.branch ||
          getBranchLabel(detail.branchId || transaction.branchId, branchMap),
        department:
          transaction.department ||
          getDepartmentLabel(
            detail.departmentId || transaction.departmentId,
            departmentMap,
          ),
        journalIndex: transactionIndex.toString(),
      })),
    ),
  );

const ClosingAccountCell = ({
  row,
}: CellContext<TClosingEntryRow, unknown>) => (
  <RecordTableInlineCell>
    <AccountsInline
      accountIds={[row.original.accountId].filter((id): id is string =>
        Boolean(id),
      )}
      permissionMode="read"
      placeholder="-"
    />
  </RecordTableInlineCell>
);

const ClosingBalanceCell = ({
  row,
}: CellContext<TClosingEntryRow, unknown>) => (
  <RecordTableInlineCell className="justify-end font-mono">
    {formatAmount(row.original.balance)}
  </RecordTableInlineCell>
);

const ClosingPercentCell = ({
  onPercentChange,
  row,
}: CellContext<TClosingEntryRow, unknown> & {
  onPercentChange: TPercentChangeHandler;
}) => (
  <RecordTableInlineCell className="justify-center">
    <Input
      type="number"
      className="h-8 w-24 text-center"
      defaultValue={row.original.percent}
      onBlur={(event) =>
        onPercentChange(
          row.original.detailId,
          row.original._id,
          event.target.value,
        )
      }
    />
  </RecordTableInlineCell>
);

const ClosingTransactionCell = ({
  transactionId,
  transactionNumbers,
}: {
  transactionId?: string;
  transactionNumbers: Map<string, string>;
}) => (
  <RecordTableInlineCell>
    {(transactionId && transactionNumbers.get(transactionId)) || '-'}
  </RecordTableInlineCell>
);

const createClosingEntryColumns = (
  t: TFunction<'accounting'>,
  onPercentChange: TPercentChangeHandler,
  transactionNumbers: Map<string, string>,
): ColumnDef<TClosingEntryRow>[] => [
  {
    id: 'accountId',
    accessorKey: 'accountId',
    header: () => <RecordTable.InlineHead label={t('account')} />,
    cell: ClosingAccountCell,
    size: 320,
  },
  {
    id: 'balance',
    accessorKey: 'balance',
    header: () => <RecordTable.InlineHead label={t('Balance')} />,
    cell: ClosingBalanceCell,
    size: 160,
  },
  {
    id: 'percent',
    accessorKey: 'percent',
    header: () => <RecordTable.InlineHead label={t('Tax percent')} />,
    cell: (context) => (
      <ClosingPercentCell {...context} onPercentChange={onPercentChange} />
    ),
    size: 140,
  },
  {
    id: 'mainAccTrId',
    accessorKey: 'mainAccTrId',
    header: () => <RecordTable.InlineHead label={t('Main transaction')} />,
    cell: ({ row }) => (
      <ClosingTransactionCell
        transactionId={row.original.mainAccTrId}
        transactionNumbers={transactionNumbers}
      />
    ),
    size: 220,
  },
  {
    id: 'integrateTrId',
    accessorKey: 'integrateTrId',
    header: () => <RecordTable.InlineHead label={t('Integrate transaction')} />,
    cell: ({ row }) => (
      <ClosingTransactionCell
        transactionId={row.original.integrateTrId}
        transactionNumbers={transactionNumbers}
      />
    ),
    size: 220,
  },
];

type TClosingActionButtonsProps = {
  error?: string;
  loading: {
    calculate: boolean;
    run: boolean;
    clear: boolean;
    publish: boolean;
    cancel: boolean;
    remove: boolean;
  };
  onCalculate: () => void;
  onCancel: () => void;
  onClear: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onRun: () => void;
  status?: string;
};

const ClosingActionButtons = ({
  error,
  loading,
  onCalculate,
  onCancel,
  onClear,
  onDelete,
  onPublish,
  onRun,
  status,
}: TClosingActionButtonsProps) => {
  const { t } = useTranslation('accounting');
  const currentStatus = status || ADJ_CLOSING_STATUSES.DRAFT;

  const deleteButton = (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={onDelete}
      disabled={loading.remove}
    >
      {loading.remove ? <Spinner /> : <IconTrashX />}
      {t('delete')}
    </Button>
  );

  switch (currentStatus) {
    case ADJ_CLOSING_STATUSES.DRAFT:
      return (
        <>
          <Button onClick={onCalculate} disabled={loading.calculate}>
            {loading.calculate ? <Spinner /> : <IconCalculator />}
            {t('Calculate')}
          </Button>
          {deleteButton}
        </>
      );

    case ADJ_CLOSING_STATUSES.PROCESS:
    case ADJ_CLOSING_STATUSES.WARNING:
      return (
        <>
          <Button onClick={onCalculate} disabled={loading.calculate}>
            {loading.calculate ? <Spinner /> : <IconRefresh />}
            {t('recalc')}
          </Button>
          {currentStatus === ADJ_CLOSING_STATUSES.PROCESS && !error && (
            <Button onClick={onRun} disabled={loading.run}>
              {loading.run ? <Spinner /> : <IconPlayerPlay />}
              {t('do-transaction')}
            </Button>
          )}
          {deleteButton}
        </>
      );

    case ADJ_CLOSING_STATUSES.COMPLETE:
      return (
        <>
          <Button
            variant="secondary"
            className="text-destructive"
            onClick={onClear}
            disabled={loading.clear}
          >
            {loading.clear ? <Spinner /> : <IconEraser />}
            {t('Clear transactions')}
          </Button>
          <Button onClick={onPublish} disabled={loading.publish}>
            {loading.publish ? <Spinner /> : <IconGavel />}
            {t('publish')}
          </Button>
        </>
      );

    case ADJ_CLOSING_STATUSES.PUBLISH:
      return (
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={onCancel}
          disabled={loading.cancel}
        >
          {loading.cancel ? <Spinner /> : <IconLockOpen />}
          {t('Unpublish')}
        </Button>
      );

    default:
      return null;
  }
};

export const AdjustClosingDetail = ({ id }: AdjustClosingDetailProps) => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const { adjustClosingDetail, loading } = useAdjustClosingDetail({
    variables: { _id: id ?? '' },
    skip: !id,
  });

  const {
    adjustClosingDetails,
    adjustClosingDetailsCount,
    loading: detailsLoading,
    handleFetchMore,
  } = useAdjustClosingDetails({
    variables: { _id: id ?? '' },
    skip: !id,
  });

  const { adjustClosingEdit } = useAdjustClosingEdit();
  const { openDetail } = useSettingsPanel(ADJUST_CLOSING_CONTENT_TYPE);
  const {
    calculateAdjust,
    calculateLoading,
    runAdjust,
    loading: runLoading,
    clearTransactions,
    clearLoading,
  } = useAdjustClosingRun(id ?? '');
  const { publishAdjust, loading: publishLoading } = useAdjustClosingPublish(
    id ?? '',
  );
  const { cancelAdjust, loading: cancelLoading } = useAdjustClosingCancel(
    id ?? '',
  );
  const { removeAdjust, loading: removeLoading } =
    useAdjustClosingEntryRemove();

  const closingDetails = useMemo(
    () => adjustClosingDetail?.details ?? [],
    [adjustClosingDetail?.details],
  );
  const branchIds = useMemo(
    () =>
      [...new Set(closingDetails.map((detail) => detail.branchId))].filter(
        (branchId): branchId is string => Boolean(branchId),
      ),
    [closingDetails],
  );
  const departmentIds = useMemo(
    () =>
      [...new Set(closingDetails.map((detail) => detail.departmentId))].filter(
        (departmentId): departmentId is string => Boolean(departmentId),
      ),
    [closingDetails],
  );

  const { branches, loading: branchesLoading } = useBranchesMain({
    variables: { ids: branchIds, withoutUserFilter: true },
    skip: branchIds.length === 0,
  });
  const { departments, loading: departmentsLoading } = useDepartmentsMain({
    variables: { ids: departmentIds, withoutUserFilter: true },
    skip: departmentIds.length === 0,
  });

  const linkedTransactionParentId = useMemo(
    () =>
      [
        adjustClosingDetail?.closePeriodTrId,
        adjustClosingDetail?.earningTrId,
        adjustClosingDetail?.taxPayableTrId,
      ].find(Boolean),
    [
      adjustClosingDetail?.closePeriodTrId,
      adjustClosingDetail?.earningTrId,
      adjustClosingDetail?.taxPayableTrId,
    ],
  );
  const { transactions = [], loading: transactionsLoading } =
    useTransactionsDetail({
      variables: { _id: linkedTransactionParentId ?? '' },
      skip: !linkedTransactionParentId,
    });
  const transactionColumns = useMemo(
    () =>
      tbalanceColumns(t).filter(
        (column) => column.id !== 'more' && !column.id?.includes('details'),
      ),
    [t],
  );

  const branchMap = useMemo<TStructureLabelMap>(
    () =>
      Object.fromEntries(
        (branches ?? []).map((branch) => [branch._id, branch]),
      ),
    [branches],
  );
  const departmentMap = useMemo<TStructureLabelMap>(
    () =>
      Object.fromEntries(
        (departments ?? []).map((department) => [department._id, department]),
      ),
    [departments],
  );
  const transactionRows = useMemo(
    () => makeLinkedTransactionRows(transactions, branchMap, departmentMap),
    [branchMap, departmentMap, transactions],
  );

  const handleCalculate = () => calculateAdjust();
  const handleRun = () => runAdjust();
  const handlePublish = () => publishAdjust();
  const handleCancel = () => cancelAdjust();
  const handleClear = () => {
    if (!clearLoading) {
      void confirm({
        message: t(
          'Are you sure you want to delete the transactions of this closing?',
        ),
      }).then(() => clearTransactions());
    }
  };
  const handleDelete = () => {
    if (id && !removeLoading) {
      void confirm({
        message: t('Are you sure you want to delete this adjustment?'),
      }).then(() =>
        removeAdjust(id, {
          onError: (error) =>
            notifyMutationResult(
              false,
              t(error.message, { nsSeparator: false }),
            ),
          onCompleted: () =>
            notifyMutationResult(true, t('Adjustment deleted successfully')),
        }),
      );
    }
  };

  const handlePercentChange = useCallback(
    (detailId: string, entryId: string, value: string) => {
      if (!id) return;
      const percent = Number(value) || 0;

      adjustClosingEdit({
        variables: { _id: id, detailId, entryId, percent },
      });
    },
    [adjustClosingEdit, id],
  );

  const transactionNumbers = useMemo(
    () => getTransactionNumbers(transactions),
    [transactions],
  );
  const columns = useMemo(
    () => createClosingEntryColumns(t, handlePercentChange, transactionNumbers),
    [handlePercentChange, t, transactionNumbers],
  );

  if (loading || detailsLoading || branchesLoading || departmentsLoading) {
    return <Spinner />;
  }

  if (!id) {
    return null;
  }

  return (
    <>
      <div className="m-3">
        <h3 className="text-lg font-bold">{t('Adjust Closing Detail')}</h3>

        {adjustClosingDetail && (
          <AdjustClosingStatusBar adjustClosing={adjustClosingDetail} />
        )}

        <div className="flex justify-end items-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">
              {t('Status:', { nsSeparator: false })}
            </span>
            <span className="text-primary font-bold uppercase">
              {adjustClosingDetail?.status ? t(adjustClosingDetail.status) : ''}
            </span>
          </div>

          {adjustClosingDetail?.status && (
            <span className="text-sm text-muted-foreground">
              {`${format(
                adjustClosingDetail.updatedAt ?? adjustClosingDetail.createdAt,
                'yyyy-MM-dd HH:mm:ss',
              )}: ${t(adjustClosingDetail.status)}`}
            </span>
          )}

          <div className="flex gap-2">
            <ClosingActionButtons
              error={adjustClosingDetail?.error}
              loading={{
                calculate: calculateLoading,
                run: runLoading,
                clear: clearLoading,
                publish: publishLoading,
                cancel: cancelLoading,
                remove: removeLoading,
              }}
              onCalculate={handleCalculate}
              onCancel={handleCancel}
              onClear={handleClear}
              onDelete={handleDelete}
              onPublish={handlePublish}
              onRun={handleRun}
              status={adjustClosingDetail?.status}
            />
            {adjustClosingDetail?.status !== ADJ_CLOSING_STATUSES.PUBLISH && (
              <Button variant="outline" onClick={() => id && openDetail(id)}>
                <IconEdit />
                {t('edit')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="calculation" className="mx-3 mb-3 mt-4 space-y-4">
        <Tabs.List className="w-fit">
          <Tabs.Trigger value="calculation">{t('Calculation')}</Tabs.Trigger>
          <Tabs.Trigger value="transactions">{t('transactions')}</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="calculation" className="space-y-4">
          {closingDetails.length > 0 ? (
            closingDetails.map((detail) => (
              <ClosingDetailGroup
                key={detail._id}
                branchMap={branchMap}
                columns={columns}
                departmentMap={departmentMap}
                detail={detail}
              />
            ))
          ) : (
            <div className="p-10 text-center border-2 border-dashed rounded-lg text-muted-foreground">
              {t('No entries found. Please check your process.')}
            </div>
          )}

          {adjustClosingDetail?.error && (
            <div className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
              {`${
                adjustClosingDetail.checkedAt
                  ? format(
                      new Date(adjustClosingDetail.checkedAt),
                      'yyyy-MM-dd HH:mm:ss',
                    )
                  : ''
              }: ${adjustClosingDetail.error}`}
            </div>
          )}

          {adjustClosingDetail?.warning && (
            <div className="rounded-md border border-warning/30 p-3 text-sm text-warning">
              {adjustClosingDetail.warning}
            </div>
          )}

          {typeof adjustClosingDetail?.taxImpactValue === 'number' && (
            <div className="rounded-md border p-3 text-sm">
              {t('Tax impact:', { nsSeparator: false })}{' '}
              <b>
                {new Intl.NumberFormat().format(
                  adjustClosingDetail.taxImpactValue,
                )}
              </b>
            </div>
          )}

          {!detailsLoading &&
            adjustClosingDetailsCount >
              adjustClosingDetails.reduce(
                (total, detail) => total + (detail.entries?.length || 0),
                0,
              ) && (
              <Button
                onClick={handleFetchMore}
                variant="ghost"
                className="w-full"
              >
                {t('Load More')}
              </Button>
            )}
        </Tabs.Content>
        <Tabs.Content value="transactions">
          <ClosingLinkedTransactionsTable
            columns={transactionColumns}
            loading={transactionsLoading}
            parentId={linkedTransactionParentId}
            rows={transactionRows}
          />
        </Tabs.Content>
      </Tabs>
    </>
  );
};

const ClosingLinkedTransactionsTable = ({
  columns,
  loading,
  parentId,
  rows,
}: {
  columns: ColumnDef<ITBalanceTransaction>[];
  loading: boolean;
  parentId?: string;
  rows: ITBalanceTransaction[];
}) => {
  const { t } = useTranslation('accounting');
  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center rounded-md border">
        <Spinner />
      </div>
    );
  }

  if (!parentId || !rows.length) {
    return (
      <div className="rounded-md border p-3 text-sm text-muted-foreground">
        {t('No linked transactions yet.')}
      </div>
    );
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={rows}
      stickyColumns={['account']}
      tableId={`accounting_adjust_closing_transactions_${parentId}`}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <TBalanceTableRow />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};

const ClosingDetailGroup = ({
  branchMap,
  departmentMap,
  detail,
  columns,
}: {
  branchMap: TStructureLabelMap;
  departmentMap: TStructureLabelMap;
  detail: IAdjustClosingDetailItem;
  columns: ColumnDef<TClosingEntryRow>[];
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(true);
  const rows = useMemo<TClosingEntryRow[]>(
    () =>
      (detail.entries || [])
        .filter((entry) => entry._id && entry.accountId)
        .map((entry) => ({
          _id: entry._id || '',
          detailId: detail._id,
          accountId: entry.accountId || '',
          balance: entry.balance || 0,
          percent: entry.percent,
          mainAccTrId: entry.mainAccTrId,
          integrateTrId: entry.integrateTrId,
        })),
    [detail],
  );

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <div className="flex w-full items-center justify-between gap-3 border-b bg-muted/30 px-3 py-2 text-sm font-medium">
        <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-muted-foreground">
              {t('Branch:', { nsSeparator: false })}
            </span>
            <TextOverflowTooltip
              value={formatStructureLabel(detail.branchId, branchMap)}
            />
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-muted-foreground">
              {t('Department:', { nsSeparator: false })}
            </span>
            <TextOverflowTooltip
              value={formatStructureLabel(detail.departmentId, departmentMap)}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {rows.length} {t('accounts')}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <IconChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <IconChevronRight className="size-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {open && (
        <RecordTable.Provider
          columns={columns}
          data={rows}
          stickyColumns={[]}
          tableId={`accounting_adjust_closing_detail_${detail._id}`}
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
      )}
    </div>
  );
};

const getClosingStatusIcon = (day: Date, current: Date, status?: string) => {
  if (isSameDay(day, current)) {
    if (status === ADJ_INV_STATUSES.RUNNING) {
      return <IconRotateClockwise2 className="w-5 h-5 text-yellow-500" />;
    }
    if (status === ADJ_INV_STATUSES.PROCESS) {
      return <IconClockEdit className="w-5 h-5 text-orange-500" />;
    }
    return <IconBinoculars className="w-5 h-5 text-green-500" />;
  }

  if (isBefore(day, current)) {
    return <IconCircleCheck className="w-5 h-5 text-green-500" />;
  }

  if (isAfter(day, current)) {
    return <IconHelpSquareRounded className="w-5 h-5 text-blue-400" />;
  }

  return null;
};

export const AdjustClosingStatusBar = ({
  adjustClosing,
}: {
  adjustClosing: IAdjustClosing;
}) => {
  const { beginDate, date, status } = adjustClosing;

  const start = new Date(beginDate ?? date ?? Date.now());
  const end = new Date(date ?? Date.now());
  const current = new Date();

  const days = start <= end ? eachDayOfInterval({ start, end }) : [start];

  return (
    <div className="flex flex-wrap items-center justify-start gap-2 max-w-full">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-primary font-bold">
          <DatePicker
            value={
              adjustClosing?.beginDate
                ? new Date(adjustClosing.beginDate)
                : undefined
            }
            onChange={() => null}
            className="h-8 flex w-full"
            disabled
          />
        </span>
        <span className="text-accent-foreground">{'->'}</span>
      </div>

      {days.map((day) => (
        <Tooltip key={day.toString()} delayDuration={0}>
          <Tooltip.Trigger asChild>
            {getClosingStatusIcon(day, current, status)}
          </Tooltip.Trigger>
          <Tooltip.Content sideOffset={12}>
            <span>{format(day, 'yyyy-MM-dd (EEE)')}</span>
          </Tooltip.Content>
        </Tooltip>
      ))}

      <div className="flex items-center gap-2 text-sm">
        <span className="text-accent-foreground">{'->'}</span>
        <span className="text-primary font-bold">
          <DatePicker
            value={
              adjustClosing?.date ? new Date(adjustClosing.date) : undefined
            }
            onChange={() => null}
            className="h-8 flex w-full"
            disabled
          />
        </span>
      </div>
    </div>
  );
};
