import { EmptyState, Icon } from 'modules/common/components';
import * as moment from 'moment';
import * as React from 'react';
import { IUser } from '../../auth/types';
import { ActivityTitle, Timeline } from '../styles';
import ActivityLogProcessor from '../utils';
import ActivityItem from './ActivityItem';

type Props = {
  activities: any[];
  user: IUser;
  target?: string;
  type: string;
};

class ActivityList extends React.Component<Props> {
  renderList(activity, index) {
    // tslint:disable-next-line:no-console
    console.log('ye', activity);
    const activities = activity.data;

    return (
      <div key={index}>
        {activities.length ? (
          <ActivityTitle>
            <Icon icon="calendar" /> {activity.title}
          </ActivityTitle>
        ) : null}
        {activities.map((rowData, data) => (
          <ActivityItem key={data} data={rowData} />
        ))}
      </div>
    );
  }

  renderTimeLine() {
    const { activities } = this.props;

    const result = activities.reduce((item, activity) => {
      const createdDate = moment(activity.createdAt).format('L');

      item[createdDate] = item[createdDate] || [];
      item[createdDate].push(activity);
      return item;
    }, new Array());

    return (
      <Timeline>
        {result.map((item, index) => this.renderList(item, index))}
      </Timeline>
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

    return this.renderTimeLine();
  }
}

export default ActivityList;
