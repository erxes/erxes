import React from 'react';
import { useQueryState } from 'erxes-ui/hooks';
import { ActivityLogs } from 'ui-modules';
import { customActivitiesRows } from './CustomActivitiesRows';

const ActivityList = () => {
  const [salesItemId] = useQueryState<string>('salesItemId');

  if (!salesItemId) {
    return null;
  }

  return (
    <div className="h-96">
      <ActivityLogs
        targetId={salesItemId}
        limit={50}
        customActivities={customActivitiesRows}
        emptyMessage="No activity logs found"
      />
    </div>
  );
};

export default ActivityList;
