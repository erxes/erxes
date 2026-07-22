import { ActivityLogs } from 'ui-modules';

import { DealNoteComposer } from '@/deals/cards/components/detail/overview/DealNoteComposer';
import { dealCustomActivities } from '@/deals/cards/components/detail/DealActivityRows';

const SalesNoteAndComment = ({ dealId }: { dealId: string }) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <ActivityLogs
        targetId={dealId}
        customActivities={dealCustomActivities}
        showExactDate
      />
      <DealNoteComposer dealId={dealId} />
    </div>
  );
};

export default SalesNoteAndComment;
