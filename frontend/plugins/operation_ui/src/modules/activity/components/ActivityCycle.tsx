import { ACTIVITY_ACTIONS } from '@/activity/constants';
import { IActivity } from '@/activity/types';
import { CycleInline } from '@/cycle/components/CycleInline';

export const ActivityCycle = ({
  metadata,
  action,
}: {
  metadata: IActivity['metadata'];
  action: IActivity['action'];
}) => {
  if (action === ACTIVITY_ACTIONS.CREATED) {
    return (
      <div className="inline-flex items-center gap-1">
        added cycle
        <span className="font-bold">
          <CycleInline cycleId={metadata.newValue} />
        </span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1">
      changed cycle
      <span className="font-bold">
        <CycleInline cycleId={metadata.previousValue || ''} />
      </span>
      to
      <span className="font-bold">
        <CycleInline cycleId={metadata.newValue} />
      </span>
    </div>
  );
};
