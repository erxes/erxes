import { useQueryState } from 'erxes-ui/hooks';
import { ActivityLogs } from 'ui-modules';
import { customActivitiesRows } from './customActivitiesRows';

const ActivityList = () => {
  const [salesItemId] = useQueryState<string>('salesItemId');
  if (!salesItemId) {
    return null;
  }

  return (
    <div className="h-96">
      <ActivityLogs
        targetType="sales:sales.deal"
        targetId={salesItemId}
        customActivities={customActivitiesRows}
      />
    </div>
  );
};

export default ActivityList;
