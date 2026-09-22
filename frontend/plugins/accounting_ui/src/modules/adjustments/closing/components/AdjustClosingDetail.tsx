import {
  IconBinoculars,
  IconCalculator,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconClockEdit,
  IconCrane,
  IconGavel,
  IconHelpSquareRounded,
  IconPlayerPlay,
  IconRotateClockwise2,
  IconTrashX,
} from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { eachDayOfInterval, isAfter, isBefore, isSameDay } from 'date-fns';
import { format } from 'date-fns-tz';
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
import {
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
import { useAdjustClosingEdit } from '../hooks/useAdjustClosingEdit';

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
    return id;
  }

  return [label.code, label.title].filter(Boolean).join(' - ') || id;
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

const makeLinkedTransactionRows = (
  transactions: ITransaction[],
  branchMap: TStructureLabelMap,
  departmentMap: TStructureLabelMap,
): ITBalanceTransaction[] =>
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
  );

const ClosingAccountHead = () => <RecordTable.InlineHead label="Account" />;

const ClosingBalanceHead = () => <RecordTable.InlineHead label="Balance" />;

const ClosingPercentHead = () => <RecordTable.InlineHead label="Tax percent" />;

const ClosingMainTransactionHead = () => (
  <RecordTable.InlineHead label="Main transaction" />
);

const ClosingIntegrateTransactionHead = () => (
  <RecordTable.InlineHead label="Integrate transaction" />
);

const ClosingAccountCell = ({
  row,
}: CellContext<TClosingEntryRow, unknown>) => (
  <RecordTableInlineCell>
    <AccountsInline
      accountIds={[row.original.accountId]}
      permissionMode="read"
      placeholder={row.original.accountId || '-'}
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

const ClosingMainTransactionCell = ({
  row,
}: CellContext<TClosingEntryRow, unknown>) => (
  <RecordTableInlineCell>
    {row.original.mainAccTrId || '-'}
  </RecordTableInlineCell>
);

const ClosingIntegrateTransactionCell = ({
  row,
}: CellContext<TClosingEntryRow, unknown>) => (
  <RecordTableInlineCell>
    {row.original.integrateTrId || '-'}
  </RecordTableInlineCell>
);

const createClosingEntryColumns = (
  onPercentChange: TPercentChangeHandler,
): ColumnDef<TClosingEntryRow>[] => [
  {
    id: 'accountId',
    accessorKey: 'accountId',
    header: ClosingAccountHead,
    cell: ClosingAccountCell,
    size: 320,
  },
  {
    id: 'balance',
    accessorKey: 'balance',
    header: ClosingBalanceHead,
    cell: ClosingBalanceCell,
    size: 160,
  },
  {
    id: 'percent',
    accessorKey: 'percent',
    header: ClosingPercentHead,
    cell: (context) => (
      <ClosingPercentCell {...context} onPercentChange={onPercentChange} />
    ),
    size: 140,
  },
  {
    id: 'mainAccTrId',
    accessorKey: 'mainAccTrId',
    header: ClosingMainTransactionHead,
    cell: ClosingMainTransactionCell,
    size: 220,
  },
  {
    id: 'integrateTrId',
    accessorKey: 'integrateTrId',
    header: ClosingIntegrateTransactionHead,
    cell: ClosingIntegrateTransactionCell,
    size: 220,
  },
];

const ClosingActionButtons = ({
  calculateLoading,
  error,
  onCalculate,
  onCancel,
  onDelete,
  onPublish,
  onRun,
  runLoading,
  status,
}: {
  calculateLoading: boolean;
  error?: string;
  onCalculate: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onRun: () => void;
  runLoading: boolean;
  status?: string;
}) => {
  const currentStatus = status || ADJ_INV_STATUSES.DRAFT;

  switch (currentStatus) {
    case ADJ_INV_STATUSES.DRAFT:
    case ADJ_INV_STATUSES.PROCESS:
      return (
        <>
          <Button onClick={onCalculate} disabled={calculateLoading}>
            {calculateLoading ? <Spinner /> : <IconCalculator />}
            Calculate
          </Button>
          {currentStatus === ADJ_INV_STATUSES.PROCESS && !error && (
            <Button onClick={onRun} disabled={runLoading}>
              {runLoading ? <Spinner /> : <IconPlayerPlay />}
              Do Transaction
            </Button>
          )}
          <Button
            variant="secondary"
            className="text-destructive"
            onClick={onDelete}
          >
            <IconTrashX />
            Delete
          </Button>
        </>
      );

    case ADJ_INV_STATUSES.PUBLISH:
      return (
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={onCancel}
        >
          <IconTrashX />
          Draft
        </Button>
      );

    case ADJ_INV_STATUSES.COMPLETE:
      return (
        <Button onClick={onPublish}>
          <IconGavel />
          PUBLISH
        </Button>
      );

    case ADJ_INV_STATUSES.RUNNING:
      return (
        <Button onClick={onRun}>
          <IconCrane />
          Stop
        </Button>
      );

    default:
      return null;
  }
};

export const AdjustClosingDetail = ({ id }: AdjustClosingDetailProps) => {
  const { adjustClosingDetail, loading } = useAdjustClosingDetail({
    variables: { _id: id },
    skip: !id,
  });

  const {
    adjustClosingDetails,
    adjustClosingDetailsCount,
    loading: detailsLoading,
    handleFetchMore,
  } = useAdjustClosingDetails({
    variables: { _id: id },
    skip: !id,
  });

  const { adjustClosingEdit } = useAdjustClosingEdit();
  const {
    calculateAdjust,
    calculateLoading,
    runAdjust,
    loading: runLoading,
  } = useAdjustClosingRun(id ?? '');
  const { publishAdjust } = useAdjustClosingPublish(id ?? '');
  const { cancelAdjust } = useAdjustClosingCancel(id ?? '');
  const { removeAdjust } = useAdjustClosingEntryRemove();

  const closingDetails = adjustClosingDetail?.details ?? [];
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
      variables: { _id: linkedTransactionParentId },
      skip: !linkedTransactionParentId,
    });
  const transactionColumns = useMemo(
    () =>
      tbalanceColumns.filter(
        (column) => column.id !== 'more' && !column.id?.includes('inv'),
      ),
    [],
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
  const handleDelete = () => {
    if (id) {
      removeAdjust(id);
    }
  };

  const handlePercentChange = useCallback(
    (detailId: string, entryId: string, value: string) => {
      const percent = Number(value) || 0;

      adjustClosingEdit({
        variables: { _id: id, detailId, entryId, percent },
      });
    },
    [adjustClosingEdit, id],
  );

  const columns = useMemo(
    () => createClosingEntryColumns(handlePercentChange),
    [handlePercentChange],
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
        <h3 className="text-lg font-bold">Adjust Closing Detail</h3>

        {adjustClosingDetail && (
          <AdjustClosingStatusBar adjustClosing={adjustClosingDetail} />
        )}

        <div className="flex justify-end items-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">Status:</span>
            <span className="text-primary font-bold uppercase">
              {adjustClosingDetail?.status}
            </span>
          </div>

          {adjustClosingDetail?.status && (
            <span className="text-sm text-muted-foreground">
              {`${format(
                adjustClosingDetail.updatedAt ?? adjustClosingDetail.createdAt,
                'yyyy-MM-dd HH:mm:ss',
              )}: ${adjustClosingDetail.status}`}
            </span>
          )}

          <div className="flex gap-2">
            <ClosingActionButtons
              calculateLoading={calculateLoading}
              error={adjustClosingDetail?.error}
              onCalculate={handleCalculate}
              onCancel={handleCancel}
              onDelete={handleDelete}
              onPublish={handlePublish}
              onRun={handleRun}
              runLoading={runLoading}
              status={adjustClosingDetail?.status}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="calculation" className="mx-3 mb-3 mt-4 space-y-4">
        <Tabs.List className="w-fit">
          <Tabs.Trigger value="calculation">Calculation</Tabs.Trigger>
          <Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
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
              No entries found. Please check your process.
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

          {typeof adjustClosingDetail?.taxImpactValue === 'number' && (
            <div className="rounded-md border p-3 text-sm">
              Tax impact:{' '}
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
                Load More
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
        No linked transactions yet.
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
            <span className="text-muted-foreground">Branch:</span>
            <TextOverflowTooltip
              value={formatStructureLabel(detail.branchId, branchMap)}
            />
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-muted-foreground">Department:</span>
            <TextOverflowTooltip
              value={formatStructureLabel(detail.departmentId, departmentMap)}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {rows.length} accounts
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

  const start: Date = beginDate ?? date ?? new Date();
  const end: Date = date ?? new Date();
  const current = new Date();

  const days = start <= end ? eachDayOfInterval({ start, end }) : [start];

  return (
    <div className="flex flex-wrap items-center justify-start gap-2 max-w-full">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-primary font-bold">
          <DatePicker
            value={adjustClosing?.beginDate}
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
            value={adjustClosing?.date}
            onChange={() => null}
            className="h-8 flex w-full"
            disabled
          />
        </span>
      </div>
    </div>
  );
};
