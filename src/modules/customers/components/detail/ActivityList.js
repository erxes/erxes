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
} from '../styles';
import ActivityLogProcessor from '../../ActivityLogProcessor';

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
        {activity.data.map(data => this.activityRow(data))}
      </div>
    );
  }

  render() {
    const sampleData2 = [
      {
        date: {
          year: 2017,
          month: 10
        },
        list: [
          {
            type: 'customer',
            action: 'create',
            id: 'customerId',
            createdAt: new Date('2017-11-30'),
            content: {}
          },
          {
            type: 'segment',
            action: 'create',
            id: 'segmentId',
            createdAt: new Date('2017-11-21'),
            content: {
              name: 'valuable customer'
            }
          }
        ]
      },
      {
        date: {
          year: 2017,
          month: 9
        },
        list: [
          {
            type: 'customer',
            action: 'create',
            id: 'customerId',
            createdAt: new Date('2017-10-30'),
            content: {}
          },
          {
            type: 'segment',
            action: 'create',
            id: 'segmentId',
            createdAt: new Date('2017-10-21'),
            content: {
              name: 'valuable customer'
            }
          },
          {
            type: 'conversation',
            action: 'create',
            id: 'conversationId',
            createdAt: new Date('2017-10-15'),
            content: 'Hello Alice! We have a solution for you.'
          },
          {
            type: 'conversation',
            action: 'create',
            id: 'conversationId2',
            createdAt: new Date('2017-10-10'),
            content: 'Buteegdehuun uilchilgee heseg deer'
          },
          {
            type: 'conversation',
            action: 'create',
            id: 'conversationId',
            createdAt: new Date('2017-10-05'),
            content: 'Jijig uutniih bol oilgomjtoi2 unguur'
          }
        ]
      }
    ];
    let activities = this.props.activities;
    // const activityLogProcessor = new ActivityLogProcessor(sampleData2);
    const activityLogProcessor = new ActivityLogProcessor(activities);
    activities = activityLogProcessor.process();
    console.log('activities: ', activities);

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
