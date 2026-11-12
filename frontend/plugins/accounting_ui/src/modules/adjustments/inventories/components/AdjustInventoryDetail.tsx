import {
  IconBinoculars,
  IconCircleCheck,
  IconClockEdit,
  IconCrane,
  IconGavel,
  IconHelpSquareRounded,
  IconRotateClockwise2,
  IconStopwatch,
  IconTrashX,
} from '@tabler/icons-react';
import {
  eachDayOfInterval,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
} from 'date-fns';
import { formatDate as format } from '@/utils/graphqlDate';
import {
  Button,
  RecordTable,
  Spinner,
  Tooltip,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAdjustInventoryRemove } from '~/modules/adjustments/inventories/hooks/useAdjustInventoryRemove';
import { useAdjustInventoryCancel } from '../hooks/useAdjustInventoryCancel';
import { useAdjustInventoryDetail } from '../hooks/useAdjustInventoryDetail';
import { useAdjustInventoryDetails } from '../hooks/useAdjustInventoryDetails';
import { useAdjustInventoryPublish } from '../hooks/useAdjustInventoryPublish';
import { useAdjustInventoryRun } from '../hooks/useAdjustInventoryRun';
import { useAdjustInventoryRunFinished } from '@/adjustments/inventories/hooks/useAdjustInventoryRunFinished';
import { ADJ_INV_STATUSES, IAdjustInventory } from '../types/AdjustInventory';
import { adjustDetailTableColumns } from './AdjustInventoryDetailColumns';
import { AdjustStatusBadge } from '@/adjustments/components/AdjustStatusBadge';

const toValidDate = (value?: Date | string | null) => {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);
  return isValid(date) ? date : undefined;
};

export const AdjustInventoryDetail = () => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const [id] = useQueryState<string>('id');

  const { adjustInventory, loading } = useAdjustInventoryDetail({
    variables: { _id: id ?? '' },
    skip: !id,
  });

  const {
    adjustInventoryDetails,
    adjustInventoryDetailsCount,
    loading: detailsLoading,
    handleFetchMore,
    refetch: refetchDetails,
  } = useAdjustInventoryDetails({
    variables: { _id: id ?? '' },
    skip: !id,
  });

  const { runAdjust, loading: runLoading } = useAdjustInventoryRun(id ?? '');
  const { publishAdjust, loading: publishLoading } = useAdjustInventoryPublish(
    id ?? '',
  );
  const { cancelAdjust, loading: cancelLoading } = useAdjustInventoryCancel(
    id ?? '',
  );
  const { removeAdjust, loading: removeLoading } = useAdjustInventoryRemove(
    id ?? '',
  );
  const busy = runLoading || publishLoading || cancelLoading || removeLoading;

  useAdjustInventoryRunFinished(id, adjustInventory, refetchDetails);

  if (loading || detailsLoading) {
    return <Spinner />;
  }

  if (!id) {
    return;
  }

  const handleRun = () => {
    runAdjust();
  };

  const handlePublish = () => {
    publishAdjust();
  };

  const handleCancel = () => {
    cancelAdjust();
  };

  const handleDelete = () => {
    void confirm({
      message: t('Are you sure you want to delete this adjustment?'),
    }).then(() => removeAdjust());
  };

  const checkedAt = toValidDate(adjustInventory?.checkedAt);

  const renderEvents = () => {
    const status = adjustInventory?.status || ADJ_INV_STATUSES.DRAFT;
    switch (status) {
      case ADJ_INV_STATUSES.DRAFT:
      case ADJ_INV_STATUSES.PROCESS:
        return (
          <>
            <Button onClick={handleRun} disabled={busy}>
              {runLoading ? <Spinner /> : <IconCrane />}
              {t('run')}
            </Button>
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={handleDelete}
              disabled={busy}
            >
              {removeLoading ? <Spinner /> : <IconTrashX />}
              {t('delete')}
            </Button>
          </>
        );
      case ADJ_INV_STATUSES.PUBLISH:
        return (
          <Button
            variant="secondary"
            className="text-destructive"
            onClick={handleCancel}
            disabled={busy}
          >
            {cancelLoading ? <Spinner /> : <IconTrashX />}
            {t('draft')}
          </Button>
        );
      case ADJ_INV_STATUSES.COMPLETE:
        return (
          <Button onClick={handlePublish} disabled={busy}>
            {publishLoading ? <Spinner /> : <IconGavel />}
            {t('publish')}
          </Button>
        );
      case ADJ_INV_STATUSES.RUNNING:
        return (
          <Button onClick={handleRun}>
            <IconStopwatch />
            {t('stop')}
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="m-3 flex-auto">
        <h3 className="text-lg font-bold">
          {t('inventory-adjustment-detail')}
        </h3>
        <div>
          {adjustInventory && <StatusBar adjustInventory={adjustInventory} />}
        </div>
        <div className="flex justify-end items-center col-span-2 xl:col-span-3 gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">{t('status')}:</span>
            <AdjustStatusBadge status={adjustInventory?.status} />
          </div>
          {adjustInventory?.error && (
            <span className="text-sm">
              {checkedAt ? `${format(checkedAt, 'yyyy-MM-dd HH:mm:ss')}: ` : ''}
              {adjustInventory.error}
            </span>
          )}
          {renderEvents()}
        </div>
      </div>
      <RecordTable.Provider
        columns={adjustDetailTableColumns(t)}
        data={adjustInventoryDetails || []}
        stickyColumns={['more']}
        tableId="accounting_adjust_inventory_detail_record_table"
        className="m-3"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {!detailsLoading &&
                adjustInventoryDetailsCount >
                  adjustInventoryDetails?.length && (
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

const StatusBar = ({
  adjustInventory,
}: {
  adjustInventory: IAdjustInventory;
}) => {
  const { beginDate, date, successDate, status } = adjustInventory;
  const end = toValidDate(date);
  const start = toValidDate(beginDate) ?? end;
  const current = toValidDate(successDate) ?? start;
  const days = start && end ? eachDayOfInterval({ start, end }) : [];

  const renderIcon = (day: Date) => {
    if (!current) {
      return undefined;
    }

    if (isSameDay(day, current)) {
      if (status === ADJ_INV_STATUSES.RUNNING) {
        return <IconRotateClockwise2 className="w-5 h-5 text-info" />;
      }
      if (status === ADJ_INV_STATUSES.PROCESS) {
        return <IconClockEdit className="w-5 h-5 text-warning" />;
      }
      return <IconBinoculars className="w-5 h-5 text-success" />;
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
      {days.map((day) => {
        return (
          <Tooltip key={day.toString()} delayDuration={0}>
            <Tooltip.Trigger asChild>{renderIcon(day)}</Tooltip.Trigger>
            <Tooltip.Content sideOffset={12}>
              <span>{format(day, 'yyyy-MM-dd (EEE)')}</span>
            </Tooltip.Content>
          </Tooltip>
        );
      })}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-accent-foreground">{'->'}</span>
        <span className="font-medium">{format(end, 'yyyy-MM-dd')}</span>
      </div>
    </div>
  );
};
