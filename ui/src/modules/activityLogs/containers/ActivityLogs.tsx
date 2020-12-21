import ActivityLogsContainer, {
  ActivityLogsProps
} from 'erxes-ui/lib/activityLogs/containers/ActivityLogs';
import React from 'react';

import ActivityItem from '../components/ActivityItem';

export default class ActivityLogs extends React.Component<ActivityLogsProps> {
  render() {
    return (
      <ActivityLogsContainer
        {...this.props}
        activityRenderItem={ActivityItem}
      />
    );
  }
}
