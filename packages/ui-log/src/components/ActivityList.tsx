import ActivityLogsList, {
  IActivityListProps
} from '@erxes/ui-log/src/activityLogs/components/ActivityList';

import ActivityItem from '../components/ActivityItem';
import React from 'react';

class ActivityList extends React.Component<IActivityListProps> {
  render() {
    return (
      <ActivityLogsList {...this.props} activityRenderItem={ActivityItem} />
    );
  }
}
export default ActivityList;
