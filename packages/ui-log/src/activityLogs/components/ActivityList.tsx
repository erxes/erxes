import { ActivityTitle, Timeline } from '../styles';

import ActivityItem from './ActivityItem';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IActivityLog } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import dayjs from 'dayjs';

export type IActivityListProps = {
  activities: IActivityLog[];
  user: IUser;
  target?: string;
  type: string;
  activityRenderItem?: (
    activity: IActivityLog,
    currentUser?: IUser
  ) => React.ReactNode;
};

class ActivityList extends React.Component<IActivityListProps> {
  renderItem(data) {
    return data.map((item, index) => (
      <ActivityItem
        key={index}
        activity={item}
        currentUser={this.props.user}
        activityRenderItem={this.props.activityRenderItem}
      />
    ));
  }

  renderList(activity, index) {
    const data = Object.keys(activity);

    return (
      <div key={index}>
        <ActivityTitle>{data}</ActivityTitle>
        {data.map(key => this.renderItem(activity[key]))}
      </div>
    );
  }

  renderTimeLine(activities) {
    const result = activities.reduce((item, activity) => {
      const { contentType } = activity;
      const createdDate = dayjs(activity.createdAt).format('MMMM YYYY');

      if (
        contentType === 'cards:taskDetail' &&
        dayjs(activity.createdAt) >= dayjs()
      ) {
        item.Upcoming = item.Upcoming || [];
        item.Upcoming.push(activity);
      } else {
        item[createdDate] = item[createdDate] || [];
        item[createdDate].push(activity);
      }

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
    const { activities } = this.props;

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
