import {
  IconBinoculars,
  IconCircleCheck,
  IconClockEdit,
  IconCrane,
  IconGavel,
  IconHelpSquareRounded,
  IconListCheck,
  IconRotateClockwise2,
  IconStopwatch,
  IconTrashX,
} from '@tabler/icons-react';
import { eachDayOfInterval, isAfter, isBefore, isSameDay } from 'date-fns';
import { format } from 'date-fns-tz';
import {
  Button,
  DatePicker,
  Input,
  RecordTable,
  Spinner,
  Tooltip,
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
import { useAdjustClosingEdit } from '../hooks/useAdjustClosingEdit';

interface AdjustClosingDetailProps {
  id?: string;
}

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
  const { runAdjust } = useAdjustClosingRun(id ?? '');
  const { publishAdjust } = useAdjustClosingPublish(id ?? '');
  const { cancelAdjust } = useAdjustClosingCancel(id ?? '');
  const { removeAdjust } = useAdjustClosingEntryRemove();

  if (loading || detailsLoading) {
    return <Spinner />;
  }

  if (!id) {
    return null;
  }

  const handleRun = () => runAdjust();
  const handlePublish = () => publishAdjust();
  const handleCancel = () => cancelAdjust();
  const handleDelete = () => removeAdjust(id);

  const handlePercentChange = (
    detailId: string,
    entryId: string,
    value: string,
  ) => {
    const percent = parseFloat(value);
    if (isNaN(percent)) return;

    adjustClosingEdit({
      variables: { _id: id, detailId, entryId, percent },
    });
  };

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

  // 1. Салбар бүрийн хүснэгтийг рендерлэх функц
  const renderDetailTable = (detail: any) => (
    <div
      key={detail._id}
      className="mb-8 bg-card border rounded-lg overflow-hidden shadow-sm"
    >
      <div className="bg-muted/40 p-3 flex justify-between border-b text-sm font-medium">
        <div className="flex gap-4">
          <span>
            Салбар: <b className="text-primary">{detail.branchId || 'Бүх'}</b>
          </span>
          <span>
            Хэлтэс:{' '}
            <b className="text-primary">{detail.departmentId || 'Бүх'}</b>
          </span>
        </div>
      </div>

      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-3">Account ID</th>
            <th className="p-3 text-right">Balance</th>
            <th className="p-3 text-center w-32">Percent (%)</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {detail.entries.map((entry: any) => (
            <tr key={entry._id} className="hover:bg-accent/30">
              <td className="p-3 font-mono text-xs">{entry.accountId}</td>
              <td className="p-3 text-right">
                {new Intl.NumberFormat().format(entry.balance)}
              </td>
              <td className="p-3">
                <Input
                  type="number"
                  className="h-8 text-center"
                  defaultValue={entry.percent}
                  onBlur={(e) =>
                    handlePercentChange(detail._id, entry._id, e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="m-3 flex-auto">
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

          <div className="flex gap-2">{renderEvents()}</div>
        </div>
      </div>

      <div className="m-3 space-y-4">
        {adjustClosingDetail?.details &&
        adjustClosingDetail.details.length > 0 ? (
          adjustClosingDetail.details.map(renderDetailTable)
        ) : (
          <div className="p-10 text-center border-2 border-dashed rounded-lg text-muted-foreground">
            No entries found. Please check your process.
          </div>
        )}

        {!detailsLoading &&
          adjustClosingDetailsCount > (adjustClosingDetails?.length || 0) && (
            <Button
              onClick={handleFetchMore}
              variant="ghost"
              className="w-full"
            >
              Load More
            </Button>
          )}
      </div>
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
