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
  Spinner,
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
import type {
  IAdjustFundRate,
  IAdjustFundRateDetail,
} from '../types/AdjustFundRate';
import { useAccountsInline } from '@/settings/account/hooks/useAccounts';
import type { IAccount } from '@/settings/account/types/Account';
import { SelectBranches, SelectDepartments } from 'ui-modules';

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

export const AdjustFundRateDetail = () => {
  const [id] = useQueryState<string>('id');
  const [editOpen, setEditOpen] = useState(false);

  const { adjustFundRate, loading } = useAdjustFundRateDetail({
    variables: { _id: id },
    skip: !id,
  });

  const accountIds = useMemo(
    () =>
      [
        adjustFundRate?.gainAccountId,
        adjustFundRate?.lossAccountId,
      ].filter(isPresent),
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
          {`${adjustFundRate.checkedAt ? format(new Date(adjustFundRate.checkedAt), 'yyyy-MM-dd HH:mm:ss') : ''}: ${adjustFundRate.error}`}
        </div>
      )}

      {groupedDetails.length > 0 ? (
        <div className="flex flex-col gap-3">
          {groupedDetails.map((group) => (
            <div
              key={`${group.branchId || 'no-branch'}:${group.departmentId || 'no-department'}`}
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
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-medium">Account</th>
                      <th className="p-2 text-right font-medium">
                        Main Balance
                      </th>
                      <th className="p-2 text-right font-medium">
                        Currency Balance
                      </th>
                      <th className="p-2 text-right font-medium">
                        Difference
                      </th>
                      <th className="p-2 text-center font-medium">
                        Transaction
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.details.map((detail) => (
                      <tr key={detail._id} className="border-b last:border-0">
                        <td className="p-2">
                          <div className="font-medium">
                            {detail.accountCode || detail.accountId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {detail.accountName || '-'}
                          </div>
                        </td>
                        <td className="p-2 text-right font-mono">
                          {formatAmount(detail.mainBalance)}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {formatAmount(detail.currencyBalance)}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {formatAmount(detail.diff)}
                        </td>
                        <td className="p-2 text-center text-xs text-muted-foreground">
                          {detail.transactionId || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border p-3 text-sm text-muted-foreground">
          No calculated account balances yet.
        </div>
      )}

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

const StatusBar = ({
  adjustFundRate,
}: {
  adjustFundRate: IAdjustFundRate;
}) => {
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
