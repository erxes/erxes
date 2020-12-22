import ActivityLogsList, {
  IActivityListProps
} from 'erxes-ui/lib/activityLogs/components/ActivityList';
import React from 'react';

import ActivityItem from '../components/ActivityItem';

class ActivityList extends React.Component<IActivityListProps> {
  render() {
    return (
      <ActivityLogsList {...this.props} activityRenderItem={ActivityItem} />
    );
  }
}
export default ActivityList;
