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
    let activities = this.props.activities;

    const activityLogProcessor = new ActivityLogProcessor(activities);
    activities = activityLogProcessor.process();

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
