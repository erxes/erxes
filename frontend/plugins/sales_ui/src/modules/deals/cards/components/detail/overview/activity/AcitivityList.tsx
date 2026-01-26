import { useQueryState } from 'erxes-ui/hooks';
import { ActivityLogs } from 'ui-modules';
import { customActivitiesRows } from './CustomActivitiesRows';

const ActivityList = () => {
  const [salesItemId] = useQueryState<string>('salesItemId');
  if (!salesItemId) {
    return null;
  }

  return (
    <div className="h-full">
      <ActivityLogs
        targetId={salesItemId}
        customActivities={customActivitiesRows}
      />
    </div>
  );
};

export default ActivityList;
