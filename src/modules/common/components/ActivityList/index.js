import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NameCard, Icon, EmptyState } from 'modules/common/components';
import {
  Timeline,
  ActivityTitle,
  ActivityRow,
  ActivityIcon,
  AvatarWrapper,
  ActivityWrapper,
  ActivityCaption
} from './styles';

const propTypes = {
  activities: PropTypes.array,
  user: PropTypes.object
};

class ActivityList extends React.Component {
  activityRow(data) {
    const currentUser = this.props.user;

    return (
      <ActivityRow key={Math.random()}>
        <ActivityIcon color={data.color}>
          <Icon icon={data.icon} />
        </ActivityIcon>
        <ActivityWrapper>
          <AvatarWrapper>
            <NameCard.Avatar user={currentUser} size={50} />
          </AvatarWrapper>
          <ActivityCaption>{data.caption}</ActivityCaption>
          <div>{moment(data.date).fromNow()}</div>
        </ActivityWrapper>
      </ActivityRow>
    );
  }

  renderList(activity) {
    return (
      <div key={Math.random()}>
        <ActivityTitle>{activity.title}</ActivityTitle>
        {activity.datas.map(data => this.activityRow(data))}
      </div>
    );
  }

  render() {
    const sampleData = [
      {
        title: 'October 2017',
        datas: [
          {
            caption: 'Registered to Erxes',
            date: new Date('2017-01-30'),
            icon: 'android-bar',
            color: '#A389D4'
          },
          {
            caption: 'Moved to segment',
            date: new Date('2017-04-21'),
            icon: 'android-bicycle',
            color: '#04A9F5'
          },
          {
            caption: 'Hello Alice! We have a solution for you.',
            date: new Date(),
            icon: 'android-boat',
            color: '#F44236'
          },
          {
            caption: 'Buteegdehuun uilchilgee heseg deer',
            date: new Date(),
            icon: 'android-bus',
            color: '#F5C22B'
          },
          {
            caption: 'Jijig uutniih bol oilgomjtoi2 unguur',
            date: new Date(),
            icon: 'android-calendar',
            color: '#67C682'
          }
        ]
      },
      {
        title: 'Upcoming',
        datas: [
          {
            caption: 'Registered to Erxes',
            date: new Date('2017-09-16'),
            icon: 'android-calendar',
            color: '#393C40',
            content: 'Merge branch redesign-ui of into redesign-ui'
          }
        ]
      }
    ];

    let activities = this.props.activities;
    activities = sampleData;

    if (!activities || activities.length < 1) {
      return (
        <EmptyState
          text="There aren’t any activities at the moment."
          icon="android-more-horizontal"
        />
      );
    }

    return <Timeline>{activities.map(item => this.renderList(item))}</Timeline>;
  }
}

ActivityList.propTypes = propTypes;

export default ActivityList;
