import {
  IconBinoculars,
  IconCircleCheck,
  IconClockEdit,
  IconCrane,
  IconGavel,
  IconHelpSquareRounded,
  IconRotateClockwise2,
  IconStopwatch,
  IconTrashX
} from '@tabler/icons-react';
import {
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay
} from 'date-fns';
import {
  Button,
  DatePicker,
  RecordTable,
  Spinner,
  Tooltip,
  useQueryState
} from 'erxes-ui';
import { useAdjustInventoryRemove } from '~/modules/adjustments/inventories/hooks/useAdjustInventoryRemove';
import { useAdjustInventoryCancel } from '../hooks/useAdjustInventoryCancel';
import { useAdjustInventoryDetail } from '../hooks/useAdjustInventoryDetail';
import { useAdjustInventoryDetails } from '../hooks/useAdjustInventoryDetails';
import { useAdjustInventoryPublish } from '../hooks/useAdjustInventoryPublish';
import { useAdjustInventoryRun } from '../hooks/useAdjustInventoryRun';
import { ADJ_INV_STATUSES, IAdjustInventory } from '../types/AdjustInventory';
import { adjustDetailTableColumns } from './AdjustInventoryDetailColumns';

export const AdjustInventoryDetail = () => {
  // const parentId = useParams().parentId;
  const [id] = useQueryState<string>('id');

  const { adjustInventory, loading } = useAdjustInventoryDetail({
    variables: { _id: id },
    skip: !id,
  });

  const { adjustInventoryDetails, adjustInventoryDetailsCount, loading: detailsLoading, handleFetchMore } = useAdjustInventoryDetails({
    variables: { _id: id },
    skip: !id,
  });

  const { runAdjust, loading: runLoading } = useAdjustInventoryRun(id ?? '');
  const { publishAdjust, loading: publishLoading } = useAdjustInventoryPublish(id ?? '');
  const { cancelAdjust, loading: cancelLoading } = useAdjustInventoryCancel(id ?? '');
  const { removeAdjust, loading: removeLoading } = useAdjustInventoryRemove(id ?? '');

  if (loading || detailsLoading) {
    return <Spinner />;
  }

  if (!id) {
    return;
  }

  const handleRun = () => {
    runAdjust();
  }

  const handlePublish = () => {
    publishAdjust();
  }

  const handleCancel = () => {
    cancelAdjust();
  }

  const handleDelete = () => {
    removeAdjust()
  }

  const renderEvents = () => {
    const status = adjustInventory?.status || ADJ_INV_STATUSES.DRAFT;
    switch (status) {
      case ADJ_INV_STATUSES.DRAFT:
      case ADJ_INV_STATUSES.PROCESS:
        return (
          <>
            <Button
              onClick={handleRun}
            >
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
        )
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
        )
      case ADJ_INV_STATUSES.COMPLETE:
        return (
          <Button
            onClick={handlePublish}
          >
            <IconGavel />
            PUBLISH
          </Button>
        )
      case ADJ_INV_STATUSES.RUNNING:
        return (
          <Button
            // disabled={true}
            onClick={handleRun}
          >
            <IconStopwatch />
            Stop
          </Button>

        )

      default:
        return null;
    }
  }

  return (
    <>
      <div className="m-3 flex-auto">
        <h3 className="text-lg font-bold">
          Inventory Adjustment Detail
        </h3>
        <div>
          {adjustInventory && <StatusBar adjustInventory={adjustInventory} />}
        </div>
        <div className="flex justify-end items-center col-span-2 xl:col-span-3 gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">Status:</span>
            <span className="text-primary font-bold">
              {adjustInventory?.status}
            </span>
          </div>
          {adjustInventory?.error && <span className='text-sm'>{`${format(adjustInventory?.checkedAt ?? '', 'yyyy-MM-dd hh:mm:ss')}: ${adjustInventory.error}`}</span>}
          {renderEvents()}
        </div>
      </div>
      <RecordTable.Provider
        columns={adjustDetailTableColumns}
        data={adjustInventoryDetails || []}
        stickyColumns={[]}
        className='m-3'
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {!detailsLoading && adjustInventoryDetailsCount > adjustInventoryDetails?.length && (
                <RecordTable.RowSkeleton rows={4} handleInView={handleFetchMore} />
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </>
  );
};

const StatusBar = ({ adjustInventory }: { adjustInventory: IAdjustInventory }) => {
  const { beginDate, date, successDate, status } = adjustInventory;
  const start = beginDate ?? date;
  const end = date;
  const current = successDate ?? start;
  const days = eachDayOfInterval({ start, end, });

  const renderIcon = (day: Date) => {
    if (isSameDay(day, current)) {

      if (status === ADJ_INV_STATUSES.RUNNING) {
        return <IconRotateClockwise2 className="w-5 h-5 text-yellow-500" />
      }
      if (status === ADJ_INV_STATUSES.PROCESS) {
        return <IconClockEdit className="w-5 h-5 text-orange-500" />
      }
      return <IconBinoculars className="w-5 h-5 text-green-500" />
    }
    if (isBefore(day, current)) {
      return <IconCircleCheck className="w-5 h-5 text-green-500" />;
    }
    if (isAfter(day, current)) {
      return <IconHelpSquareRounded className="w-5 h-5 text-blue-400" />;
    }
    return undefined;
  }


  return (
    <div className="flex flex-wrap items-center justify-start gap-2 max-w-full">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-primary font-bold">
          <DatePicker
            value={adjustInventory?.beginDate}
            onChange={() => null}
            className="h-8 flex w-full"
            disabled={true}
          />
        </span>
        <span className="text-accent-foreground">{'->'}</span>
      </div>
      {days.map((day) => {
        return (
          <Tooltip delayDuration={0}>
            <Tooltip.Trigger asChild>
              {renderIcon(day)}
            </Tooltip.Trigger>
            <Tooltip.Content sideOffset={12}>
              <span>{format(day, 'yyyy-MM-dd (EEE)')}</span>
            </Tooltip.Content>
          </Tooltip>
        )
      })}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-accent-foreground">{'->'}</span>
        <span className="text-primary font-bold">
          <DatePicker
            value={adjustInventory?.date}
            onChange={() => null}
            className="h-8 flex w-full"
            disabled={true}
          />
        </span>
      </div>
    </div>
  );
}