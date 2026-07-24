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
import {
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
} from 'date-fns';
import {
  Button,
  DatePicker,
  Dialog,
  Form,
  RecordTable,
  Spinner,
  Tooltip,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import {
  useAdjustFixedAssetRemove,
  useAdjustFixedAssetRun,
  useAdjustFixedAssetTransaction,
} from '../hooks/useAdjustFixedAssetMutations';
import { useAdjustFixedAssetDetail } from '../hooks/useAdjustFixedAssetDetail';
import { useAdjustFxaDetails } from '../hooks/useAdjustFxaDetails';
import { ADJ_FXA_STATUSES, IAdjustFixedAsset } from '../types/AdjustFixedAsset';
import { adjustFxaDetailColumns } from './AdjustFxaDetailColumns';

export const AdjustFixedAssetDetail = () => {
  const { t } = useTranslation('accounting');
  const [id] = useQueryState<string>('id');
  const { adjustFixedAsset, loading } = useAdjustFixedAssetDetail({
    variables: { _id: id },
    skip: !id,
  });
  const {
    adjustFxaDetails,
    adjustFxaDetailsCount,
    loading: detailsLoading,
    handleFetchMore,
  } = useAdjustFxaDetails({
    variables: { _id: id, page: 1, perPage: ACC_TRS__PER_PAGE },
    skip: !id,
  });
  const { runAdjustFixedAsset, loading: runLoading } = useAdjustFixedAssetRun(
    id || '',
  );
  const { removeAdjustFixedAsset, loading: removeLoading } =
    useAdjustFixedAssetRemove(id || '');

  if (loading || detailsLoading) {
    return <Spinner />;
  }

  if (!id || !adjustFixedAsset) {
    return null;
  }

  const status = adjustFixedAsset.status || ADJ_FXA_STATUSES.DRAFT;
  const canRun =
    status === ADJ_FXA_STATUSES.DRAFT || status === ADJ_FXA_STATUSES.PROCESS;
  const canTransact =
    status === ADJ_FXA_STATUSES.PROCESS && !adjustFixedAsset.error;
  const canDelete = canRun;

  return (
    <>
      <div className="m-3 flex-auto">
        <h3 className="text-lg font-bold">
          {t('fixed-asset-adjustment-detail')}
        </h3>
        <StatusBar adjustFixedAsset={adjustFixedAsset} />
        <div className="flex justify-end items-center col-span-2 xl:col-span-3 gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">{t('status')}:</span>
            <span className="text-primary font-bold">{status}</span>
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
            <Button
              onClick={() => runAdjustFixedAsset()}
              disabled={runLoading || removeLoading}
            >
              {runLoading ? <Spinner /> : <IconCrane />}
              {t('run')}
            </Button>
          )}
          {canTransact && <AdjustFixedAssetTransactionDialog adjustId={id} />}
          {canDelete && (
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={() => removeAdjustFixedAsset()}
              disabled={runLoading || removeLoading}
            >
              {removeLoading ? <Spinner /> : <IconTrashX />}
              {t('delete')}
            </Button>
          )}
        </div>
      </div>
      <RecordTable.Provider
        columns={adjustFxaDetailColumns}
        data={adjustFxaDetails}
        stickyColumns={[]}
        className="m-3"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
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
    </>
  );
};

const AdjustFixedAssetTransactionDialog = ({
  adjustId,
}: {
  adjustId: string;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const form = useForm<{ expenseAccountId?: string }>({
    defaultValues: { expenseAccountId: undefined },
  });
  const { createTransaction, loading } =
    useAdjustFixedAssetTransaction(adjustId);
  const expenseAccountId = form.watch('expenseAccountId');

  const handleSubmit = () => {
    if (!expenseAccountId) {
      return;
    }

    createTransaction({
      variables: { expenseAccountId },
      onCompleted: () => setOpen(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
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
            <Form.Field
              control={form.control}
              name="expenseAccountId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('cost-account')}</Form.Label>
                  <SelectAccount.FormItem
                    mode="single"
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as string)}
                    defaultFilter={{ permissionMode: 'write' }}
                    placeholder={t('select-accounts')}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
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
  const current = successDate || start;

  if (!start || !end) {
    return null;
  }

  const days = eachDayOfInterval({
    start: new Date(start),
    end: new Date(end),
  });

  const renderIcon = (day: Date) => {
    if (isSameDay(day, current)) {
      if (status === ADJ_FXA_STATUSES.RUNNING) {
        return <IconRotateClockwise2 className="w-5 h-5 text-yellow-500" />;
      }
      if (status === ADJ_FXA_STATUSES.PROCESS) {
        return <IconClockEdit className="w-5 h-5 text-orange-500" />;
      }
      return <IconCircleCheck className="w-5 h-5 text-green-500" />;
    }
    if (isBefore(day, current)) {
      return <IconCircleCheck className="w-5 h-5 text-green-500" />;
    }
    if (isAfter(day, current)) {
      return <IconHelpSquareRounded className="w-5 h-5 text-blue-400" />;
    }
    return undefined;
  };

  return (
    <div className="flex flex-wrap items-center justify-start gap-2 max-w-full">
      <DatePicker
        value={new Date(start)}
        onChange={() => null}
        className="h-8 flex w-full"
        disabled
      />
      {days.map((day) => (
        <Tooltip key={day.toString()} delayDuration={0}>
          <Tooltip.Trigger asChild>{renderIcon(day)}</Tooltip.Trigger>
          <Tooltip.Content sideOffset={12}>
            <span>{format(day, 'yyyy-MM-dd (EEE)')}</span>
          </Tooltip.Content>
        </Tooltip>
      ))}
      <DatePicker
        value={new Date(end)}
        onChange={() => null}
        className="h-8 flex w-full"
        disabled
      />
    </div>
  );
};
