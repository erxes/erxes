import { ACTIVITY_ACTIONS } from '@/activity/constants';
import { IActivity } from '@/activity/types';

export const ActivityEstimate = ({
  metadata,
  action,
}: {
  metadata: IActivity['metadata'];
  action: IActivity['action'];
}) => {
  if (action === ACTIVITY_ACTIONS.CREATED) {
    return (
      <div>
        added estimate point{' '}
        <span className="font-bold">{metadata.newValue}</span>
      </div>
    );
  }
  return (
    <div>
      changed estimate point{' '}
      <span className="font-bold">{metadata.previousValue}</span> to{' '}
      <span className="font-bold">{metadata.newValue}</span>
    </div>
  );
};
