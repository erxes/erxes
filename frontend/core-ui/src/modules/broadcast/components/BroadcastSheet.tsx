import { IBroadcastMethodEnum } from '@/broadcast/types';
import { Sheet, useMultiQueryState } from 'erxes-ui';
import { useBroadcastContacts } from '../hooks/useBroadcastContacts';
import { useBroadcastScheduleRange } from '../hooks/useBroadcastScheduleRange';
import { BroadcastMethod } from './list/BroadcastMethod';
import { BroadcastSteps } from './steps/BroadcastSteps';
import { BroadcastStepsSheetView } from './steps/BroadcastStepsSheetView';

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
  }>(['method', 'editMessageId']);

  const { clearRange } = useBroadcastScheduleRange();
  const { clearContacts } = useBroadcastContacts();

  const handleClose = () => {
    // The days picked on the calendar and the contact picked in the list were
    // for this campaign; leaving them behind would quietly carry them into the
    // next one.
    clearRange();
    clearContacts();
    setQueryParams({ method: null });
  };

  return (
    <Sheet
      open={!!method && !editMessageId}
      onOpenChange={(open) => !open && handleClose()}
    >
      {showTrigger && <BroadcastMethod />}

      <BroadcastStepsSheetView method={method}>
        <BroadcastSteps onClose={handleClose} />
      </BroadcastStepsSheetView>
    </Sheet>
  );
};
