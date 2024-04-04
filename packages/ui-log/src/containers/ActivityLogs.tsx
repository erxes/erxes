import ActivityLogsContainer, {
  ActivityLogsProps
} from '@erxes/ui-log/src/activityLogs/containers/ActivityLogs';

import ActivityItem from '../components/ActivityItem';
import React from 'react';

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
