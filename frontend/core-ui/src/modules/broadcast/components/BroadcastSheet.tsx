import { IBroadcastMethodEnum } from '@/broadcast/types';
import { cn, Sheet, useMultiQueryState } from 'erxes-ui';
import { useBroadcastScheduleRange } from '../hooks/useBroadcastScheduleRange';
import { BroadcastMethod } from './list/BroadcastMethod';
import { BroadcastSteps } from './steps/BroadcastSteps';

/**
 * Creating a campaign, opened by choosing a method.
 *
 * The chosen method is what holds the sheet open, rather than a flag beside
 * it: the calendar starts a campaign from a selection of days, and the
 * contacts list starts one for a single person — both have the query string to
 * hand, not this component's state. An edit carries a method too, and belongs
 * to the other sheet, so it is left alone here.
 */
export const BroadcastSheet = ({
  showTrigger = true,
}: {
  showTrigger?: boolean;
}) => {
  const [{ method, editMessageId }, setQueryParams] = useMultiQueryState<{
    method: IBroadcastMethodEnum;
    editMessageId: string;
    broadcastContactId: string;
  }>(['method', 'editMessageId', 'broadcastContactId']);

  const { clearRange } = useBroadcastScheduleRange();

  const handleClose = () => {
    // The days picked on the calendar and the contact picked in the list were
    // for this campaign; leaving them behind would quietly carry them into the
    // next one.
    clearRange();
    setQueryParams({ method: null, broadcastContactId: null });
  };

  return (
    <Sheet
      open={!!method && !editMessageId}
      onOpenChange={(open) => !open && handleClose()}
    >
      {showTrigger && <BroadcastMethod onSelect={() => undefined} />}

      <Sheet.View
        className={cn(
          'sm:max-w-7xl',
          // The workflow canvas is the campaign's content, so it gets the room
          // a form-based method does not need. Overridden at the same
          // breakpoint as the sheet's own `md:w-3/4`, which a plain `w-*`
          // class would lose to.
          method === IBroadcastMethodEnum.WORKFLOW &&
            'sm:max-w-none md:w-[calc(100vw-1rem)]',
        )}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <BroadcastSteps onClose={handleClose} />
      </Sheet.View>
    </Sheet>
  );
};
