import { IBroadcastMethodEnum } from '@/broadcast/types';
import { cn, Sheet, useMultiQueryState } from 'erxes-ui';
import { useBroadcastScheduleRange } from '../hooks/useBroadcastScheduleRange';
import { BroadcastMethod } from './list/BroadcastMethod';
import { BroadcastSteps } from './steps/BroadcastSteps';

/**
 * Creating a campaign, opened by choosing a method.
 *
 * The chosen method is what holds the sheet open, rather than a flag beside
 * it: the calendar starts a campaign from a selection of days, and it has the
 * query string to hand, not this component's state. An edit carries a method
 * too, and belongs to the other sheet, so it is left alone here.
 */
export const BroadcastSheet = () => {
  const [{ method, editMessageId }, setQueryParams] = useMultiQueryState<{
    method: IBroadcastMethodEnum;
    editMessageId: string;
  }>(['method', 'editMessageId']);

  const { clearRange } = useBroadcastScheduleRange();

  const handleClose = () => {
    // The days picked on the calendar were for this campaign; leaving them
    // behind would quietly schedule the next one into them.
    clearRange();
    setQueryParams({ method: null });
  };

  return (
    <Sheet
      open={!!method && !editMessageId}
      onOpenChange={(open) => !open && handleClose()}
    >
      <BroadcastMethod onSelect={() => undefined} />

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
