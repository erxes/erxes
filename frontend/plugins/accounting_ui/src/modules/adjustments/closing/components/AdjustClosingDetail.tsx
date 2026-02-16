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
  isToday,
} from 'date-fns';
import { format } from 'date-fns-tz';
import {
  Button,
  DatePicker,
  RecordTable,
  Spinner,
  Tooltip,
  useQueryState,
} from 'erxes-ui';
import { IAdjustClosing } from '~/modules/adjustments/closing/types/AdjustClosing';
import { ADJ_INV_STATUSES } from '~/modules/adjustments/inventories/types/AdjustInventory';
import { useAdjustClosingRun } from '../hooks/useAdjustClosingRun';
import {
  useAdjustClosingDetail,
  useAdjustClosingDetails,
} from '../hooks/useAdjustClosingDetail';
import { useAdjustClosingPublish } from '../hooks/useAdjustClosingPublish';
import { useAdjustClosingEntryRemove } from '../hooks/useAdjustClosingRemove';
import { useAdjustClosingCancel } from '../hooks/useAdjustClosingCancel';
import { adjustClosingDetailTableColumns } from './AdjustClosingDetailColumns';

export const AdjustClosingDetail = () => {
  const [id] = useQueryState<string>('id');

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

  const { runAdjust, loading: runLoading } = useAdjustClosingRun(id ?? '');
  const { publishAdjust, loading: publishLoading } = useAdjustClosingPublish(
    id ?? '',
  );
  const { cancelAdjust, loading: cancelLoading } = useAdjustClosingCancel(
    id ?? '',
  );
  const { removeAdjust, loading: removeLoading } =
    useAdjustClosingEntryRemove();

  if (loading || detailsLoading) {
    return <Spinner />;
  }

  if (!id) {
    return null;
  }

  const handleRun = () => runAdjust();
  const handlePublish = () => publishAdjust();
  const handleCancel = () => cancelAdjust();
  const handleDelete = () => removeAdjust([id]);

  const renderEvents = () => {
    const status = adjustClosingDetail?.status || ADJ_INV_STATUSES.DRAFT;

    switch (status) {
      case ADJ_INV_STATUSES.DRAFT:
      case ADJ_INV_STATUSES.PROCESS:
        return (
          <>
            <Button onClick={handleRun}>
              <IconCrane />
              RUN
            </Button>
            <Button
              variant="secondary"
              className="text-destructive"
              onClick={handleDelete}
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
            onClick={handleCancel}
          >
            <IconTrashX />
            Draft
          </Button>
        );

      case ADJ_INV_STATUSES.COMPLETE:
        return (
          <Button onClick={handlePublish}>
            <IconGavel />
            PUBLISH
          </Button>
        );

      case ADJ_INV_STATUSES.RUNNING:
        return (
          <Button onClick={handleRun}>
            <IconStopwatch />
            Stop
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="m-3 flex-auto">
        <h3 className="text-lg font-bold">Adjust Closing Detail</h3>

        {adjustClosingDetail && (
          <AdjustClosingStatusBar adjustClosing={adjustClosingDetail} />
        )}

        <div className="flex justify-end items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">Status:</span>
            <span className="text-primary font-bold">
              {adjustClosingDetail?.status}
            </span>
          </div>

          {adjustClosingDetail?.status && (
            <span className="text-sm">
              {`${format(
                adjustClosingDetail.updatedAt ?? adjustClosingDetail.createdAt,
                'yyyy-MM-dd HH:mm:ss',
              )}: ${adjustClosingDetail.status}`}
            </span>
          )}

          {renderEvents()}
        </div>
      </div>

      <RecordTable.Provider
        columns={adjustClosingDetailTableColumns}
        data={adjustClosingDetails || []}
        stickyColumns={[]}
        className="m-3"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {!detailsLoading &&
                adjustClosingDetailsCount > adjustClosingDetails?.length && (
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

  const renderIcon = (day: Date) => {
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
