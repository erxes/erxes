import dayjs from 'dayjs';
import EmptyState from 'modules/common/components/EmptyState';
import React from 'react';
import { IUser } from '../../auth/types';
import { ActivityTitle, Timeline } from '../styles';
import { IActivityLog } from '../types';
import ActivityItem from './ActivityItem';

type Props = {
  activities: IActivityLog[];
  user: IUser;
  target?: string;
  type: string;
};

class ActivityList extends React.Component<Props> {
  arrangeActivities(activities: any[]) {
    activities.forEach((a, i) => {
      if (a.action === 'convert') {
        const conversationId = a.content;
        let index;
        activities.some((element, idx) => {
          if (element._id === conversationId) {
            index = idx;
          }
          return element._id === conversationId;
        });
        if (index) {
          const activity = activities[index];
          activities.splice(index, 1);
          activities.splice(i + 1, 0, activity);
        }
      }
    });

    return activities;
  }

  renderItem(data: any[]) {
    return data.map(
      (item: IActivityLog, index: string | number | undefined) => (
        <ActivityItem
          key={index}
          activity={item}
          currentUser={this.props.user}
        />
      )
    );
  }

  renderList(
    activity: { [x: string]: any },
    index: string | number | undefined
  ) {
    const data = Object.keys(activity);

    return (
      <div key={index}>
        <ActivityTitle>{data}</ActivityTitle>
        {data.map(key => this.renderItem(activity[key]))}
      </div>
    );
  }

  renderTimeLine(activities: any[]) {
    activities = this.arrangeActivities(activities);

    const result = activities.reduce(
      (
        item: { [x: string]: any; Upcoming: any[] },
        activity: { createdAt?: any; contentType?: any }
      ) => {
        const { contentType } = activity;
        const createdDate = dayjs(activity.createdAt).format('MMMM YYYY');

        if (
          contentType === 'taskDetail' &&
          dayjs(activity.createdAt) >= dayjs()
        ) {
          item.Upcoming = item.Upcoming || [];
          item.Upcoming.push(activity);
        } else {
          item[createdDate] = item[createdDate] || [];
          item[createdDate].push(activity);
        }

        return item;
      },
      {}
    );

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
