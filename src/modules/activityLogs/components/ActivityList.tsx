import { EmptyState, Icon } from 'modules/common/components';
import * as React from 'react';
import { IUser } from '../../auth/types';
import { ActivityTitle, Timeline } from '../styles';
import ActivityLogProcessor from '../utils';
import ActivityItem from './ActivityItem';

type Props = {
  activities: any[],
  user: IUser,
  target: string,
  type: string
};

class ActivityList extends React.Component<Props> {
  renderList(activity) {
    const activities = activity.data;

    return (
      <div key={activity.title}>
        {activities.length ? (
          <ActivityTitle>
            <Icon icon="calendar" /> {activity.title}
          </ActivityTitle>
        ) : null}
        {activities.map(rowData => ActivityItem(rowData))}
      </div>
    );
  }

  render() {
    let { activities } = this.props;
    const activityLogProcessor = new ActivityLogProcessor(this.props);

    activities = activityLogProcessor.process();

    if (!activities || activities.length < 1) {
      return (
        <EmptyState
          text="There aren’t any activities at the moment."
          icon="clock"
        />
      );
    }

    return <Timeline>{activities.map(item => this.renderList(item))}</Timeline>;
  }
}

export default ActivityList;
