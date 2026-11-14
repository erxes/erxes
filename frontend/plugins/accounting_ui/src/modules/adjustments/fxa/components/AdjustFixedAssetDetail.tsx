import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdjustFixedAssetActions } from '@/adjustments/fxa/hooks/useAdjustFixedAssetActions';
import { AdjustFixedAssetTransactions } from '@/adjustments/fxa/components/AdjustFixedAssetTransactions';
import {
  IconCashRegister,
  IconCircleCheck,
  IconClockEdit,
  IconCrane,
  IconHelpSquareRounded,
  IconRotateClockwise2,
  IconTrashX,
} from '@tabler/icons-react';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { eachDayOfInterval, isAfter, isBefore, isSameDay } from 'date-fns';
import { formatDate as format } from '@/utils/graphqlDate';
import {
  Button,
  Dialog,
  Form,
  RecordTable,
  Spinner,
  Tabs,
  Tooltip,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import { useAdjustFixedAssetRemove } from '@/adjustments/fxa/hooks/useAdjustFixedAssetRemove';
import { useAdjustFixedAssetRun } from '@/adjustments/fxa/hooks/useAdjustFixedAssetRun';
import { useAdjustFixedAssetTransaction } from '@/adjustments/fxa/hooks/useAdjustFixedAssetTransaction';
import { useAdjustFixedAssetDetail } from '@/adjustments/fxa/hooks/useAdjustFixedAssetDetail';
import { useAdjustFxaDetails } from '@/adjustments/fxa/hooks/useAdjustFxaDetails';
import {
  ADJ_FXA_STATUSES,
  IAdjustFixedAsset,
} from '@/adjustments/fxa/types/AdjustFixedAsset';
import { adjustFxaDetailColumns } from '@/adjustments/fxa/components/AdjustFxaDetailColumns';
import { AdjustStatusBadge } from '@/adjustments/components/AdjustStatusBadge';

export const AdjustFixedAssetDetail = () => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const [id] = useQueryState<string>('id');
  const { adjustFixedAsset, loading, error } = useAdjustFixedAssetDetail({
    variables: { _id: id ?? '' },
    skip: !id,
  });
  const {
    adjustFxaDetails,
    adjustFxaDetailsCount,
    loading: detailsLoading,
    handleFetchMore,
  } = useAdjustFxaDetails({
    variables: { _id: id ?? '', page: 1, perPage: ACC_TRS__PER_PAGE },
    skip: !id,
  });
  const { runAdjustFixedAsset, loading: runLoading } = useAdjustFixedAssetRun(
    id || '',
  );
  const { removeAdjustFixedAsset, loading: removeLoading } =
    useAdjustFixedAssetRemove(id || '');

  const actions = useAdjustFixedAssetActions(id || '');
  const transaction = useAdjustFixedAssetTransaction(id || '');
  const busy =
    runLoading || removeLoading || actions.loading || transaction.loading;
  if (loading || detailsLoading) {
    return <Spinner />;
  }

  if (error)
    return (
      <p role="alert" className="p-3 text-destructive">
        {error.message}
      </p>
    );
  if (!id || !adjustFixedAsset)
    return <p className="p-3 text-muted-foreground">{t('no-results-found')}</p>;

  const status = adjustFixedAsset.status || ADJ_FXA_STATUSES.DRAFT;
  const canRun =
    status === ADJ_FXA_STATUSES.DRAFT ||
    status === ADJ_FXA_STATUSES.PROCESS ||
    status === ADJ_FXA_STATUSES.COMPLETE;
  const canTransact =
    status === ADJ_FXA_STATUSES.PROCESS && !adjustFixedAsset.error;
  const canDelete =
    status === ADJ_FXA_STATUSES.DRAFT || status === ADJ_FXA_STATUSES.PROCESS;
  const completed =
    status === ADJ_FXA_STATUSES.COMPLETE || status === ADJ_FXA_STATUSES.PUBLISH;
  const parentId = adjustFxaDetails.find(
    (detail) => detail.transactionId,
  )?.transactionId;

  return (
    <>
      <div className="m-3 shrink-0">
        <h3 className="text-lg font-bold">
          {t('fixed-asset-adjustment-detail')}
        </h3>
        <StatusBar adjustFixedAsset={adjustFixedAsset} />
        <div className="flex justify-end items-center col-span-2 xl:col-span-3 gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">{t('status')}:</span>
            <AdjustStatusBadge status={status} />
          </div>
          {adjustFixedAsset.error && (
            <span className="text-sm text-destructive">
              {`${format(
                adjustFixedAsset.checkedAt || new Date(),
                'yyyy-MM-dd HH:mm:ss',
              )}: ${adjustFixedAsset.error}`}
            </span>
          )}
          {canRun && (
            <Button onClick={() => runAdjustFixedAsset()} disabled={busy}>
              {runLoading ? <Spinner /> : <IconCrane />}
              {t('run')}
            </Button>
          )}
          {canTransact && (
            <AdjustFixedAssetTransactionDialog
              expenseAccountId={adjustFixedAsset.expenseAccountId || undefined}
              taxExpenseAccountId={
                adjustFixedAsset.taxExpenseAccountId || undefined
              }
              transaction={transaction}
              disabled={busy}
            />
          )}
          {completed && (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => actions.cancel()}
            >
              {t('cancel')}
            </Button>
          )}
          {status === ADJ_FXA_STATUSES.PROCESS && (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => actions.clear()}
            >
              {t('clear')}
            </Button>
          )}
          {status === ADJ_FXA_STATUSES.COMPLETE && (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => actions.publish()}
            >
              {t('publish')}
            </Button>
          )}
          {canDelete && !parentId && (
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={() => {
                void confirm({
                  message: t(
                    'Are you sure you want to delete this adjustment?',
                  ),
                }).then(() => removeAdjustFixedAsset());
              }}
              disabled={busy}
            >
              {removeLoading ? <Spinner /> : <IconTrashX />}
              {t('delete')}
            </Button>
          )}
        </div>
      </div>
      <Tabs defaultValue="details" className="mx-3 mb-3">
        <Tabs.List>
          <Tabs.Trigger value="details">{t('details')}</Tabs.Trigger>
          <Tabs.Trigger value="transactions">{t('transactions')}</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="details">
          <RecordTable.Provider
            columns={adjustFxaDetailColumns(t)}
            data={adjustFxaDetails}
            stickyColumns={[]}
            tableId="accounting_adjust_fixed_asset_detail_record_table"
            className="mt-3"
          >
            <RecordTable.Scroll>
              <RecordTable>
                <RecordTable.Header showColumnSelector />
                <RecordTable.Body>
                  <RecordTable.RowList />
                  {!detailsLoading &&
                    adjustFxaDetailsCount > adjustFxaDetails.length && (
                      <RecordTable.RowSkeleton
                        rows={4}
                        handleInView={handleFetchMore}
                      />
                    )}
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.Scroll>
          </RecordTable.Provider>
        </Tabs.Content>
        <Tabs.Content value="transactions">
          <AdjustFixedAssetTransactions
            parentId={parentId || undefined}
            completed={completed}
          />
        </Tabs.Content>
      </Tabs>
    </>
  );
};

export const AdjustFixedAssetTransactionDialog = ({
  expenseAccountId: initialExpenseAccountId,
  taxExpenseAccountId: initialTaxExpenseAccountId,
  transaction,
  disabled,
}: {
  expenseAccountId?: string;
  taxExpenseAccountId?: string;
  transaction: ReturnType<typeof useAdjustFixedAssetTransaction>;
  disabled: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const form = useForm<{
    expenseAccountId: string;
    taxExpenseAccountId: string;
  }>({
    defaultValues: {
      expenseAccountId: initialExpenseAccountId || '',
      taxExpenseAccountId: initialTaxExpenseAccountId || '',
    },
    resolver: zodResolver(
      z.object({
        expenseAccountId: z.string().min(1, t('Required')),
        taxExpenseAccountId: z.string(),
      }),
    ),
  });
  const { createTransaction, loading } = transaction;
  const expenseAccountId = form.watch('expenseAccountId');
  const taxExpenseAccountId = form.watch('taxExpenseAccountId');

  const handleSubmit = () => {
    if (!expenseAccountId) {
      return;
    }

    createTransaction({
      variables: {
        expenseAccountId,
        taxExpenseAccountId: taxExpenseAccountId || undefined,
      },
      onCompleted: () => setOpen(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button disabled={disabled}>
          <IconCashRegister />
          {t('depreciation-transaction')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{t('depreciation-transaction')}</Dialog.Title>
          <Dialog.Description>
            {t('select-depreciation-expense-account')}
          </Dialog.Description>
        </Dialog.Header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {(
              [
                { name: 'expenseAccountId', label: 'cost-account' },
                {
                  name: 'taxExpenseAccountId',
                  label: 'income-tax-expense-account',
                },
              ] as const
            ).map(({ name, label }) => (
              <Form.Field
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t(label)}</Form.Label>
                    <SelectAccount.FormItem
                      mode="single"
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(typeof value === 'string' ? value : '')
                      }
                      defaultFilter={{ permissionMode: 'write' }}
                      placeholder={t('select-accounts')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            ))}
            <Dialog.Footer className="mt-4">
              <Dialog.Close asChild>
                <Button variant="outline" type="button">
                  {t('cancel')}
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={loading || !expenseAccountId}>
                {loading && <Spinner />}
                {t('save')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};

const StatusBar = ({
  adjustFixedAsset,
}: {
  adjustFixedAsset: IAdjustFixedAsset;
}) => {
  const { beginDate, date, successDate, status } = adjustFixedAsset;
  const start = beginDate || date;
  const end = date;

  if (!start || !end) {
    return null;
  }

  const current = successDate || start;
  const days = eachDayOfInterval({
    start: new Date(start),
    end: new Date(end),
  });

  const renderIcon = (day: Date) => {
    if (isSameDay(day, current)) {
      if (status === ADJ_FXA_STATUSES.RUNNING) {
        return <IconRotateClockwise2 className="w-5 h-5 text-info" />;
      }
      if (status === ADJ_FXA_STATUSES.PROCESS) {
        return <IconClockEdit className="w-5 h-5 text-warning" />;
      }
      return <IconCircleCheck className="w-5 h-5 text-success" />;
    }
    if (isBefore(day, current)) {
      return <IconCircleCheck className="w-5 h-5 text-success" />;
    }
    if (isAfter(day, current)) {
      return (
        <IconHelpSquareRounded className="w-5 h-5 text-muted-foreground" />
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
