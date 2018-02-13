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
  ActivityCaption,
  ActivityDate,
  ActivityContent
} from '../styles';
import ActivityLogProcessor from '../utils';

const propTypes = {
  activities: PropTypes.array,
  user: PropTypes.object
};

class ActivityList extends React.Component {
  activityRow(data) {
    return (
      <ActivityRow key={Math.random()}>
        <ActivityIcon color={data.color}>
          <Icon icon={data.icon || ''} />
        </ActivityIcon>
        <ActivityWrapper>
          <AvatarWrapper>
            <NameCard.Avatar user={data.by} size={40} />
          </AvatarWrapper>
          <ActivityCaption>{data.caption}</ActivityCaption>
          <ActivityDate>{this.formatDate(data.date)}</ActivityDate>
          {data.content && <ActivityContent>{data.content}</ActivityContent>}
        </ActivityWrapper>
      </ActivityRow>
    );
  }

  formatDate(date) {
    return moment(date).fromNow();
  }

  renderList(activity) {
    const activities = activity.data;

    return (
      <div key={activity.title}>
        {activities.length ? (
          <ActivityTitle>{activity.title}</ActivityTitle>
        ) : null}
        {activities.map(rowData => this.activityRow(rowData))}
      </div>
    );
  }

  render() {
    let { activities, user } = this.props;
    const activityLogProcessor = new ActivityLogProcessor(activities, user);
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
