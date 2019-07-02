import { EmptyState } from 'modules/common/components';
import moment from 'moment';
import React from 'react';
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
  renderItem(data) {
    return data.map((item, index) => <ActivityItem key={index} data={item} />);
  }

  renderList(activity, index) {
    const data = Object.keys(activity);

    return (
      <div key={index}>
        <ActivityTitle> {data} </ActivityTitle>
        {data.map(key => this.renderItem(activity[key]))}
      </div>
    );
  }

  renderTimeLine(activities) {
    const result = activities.reduce((item, activity) => {
      const createdDate = moment(activity.createdAt).format('MMMM YYYY');

      item[createdDate] = item[createdDate] || [];
      item[createdDate].push(activity);

      return item;
    }, {});

    return (
      <Timeline>
        {Object.keys(result).map((key, index) => {
          return this.renderList({ [key]: result[key] }, index);
        })}
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

    return this.renderTimeLine(activities);
  }
}

export default ActivityList;
