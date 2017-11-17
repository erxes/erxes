import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EmptyState } from 'modules/common/components';
import { Link } from 'react-router-dom';
import {
  NotificationSeeAll,
  NotificationArea,
  NotificationList,
  NotificationWrapper
} from './styles';
import { NotificationRow } from './';

class NotificationsLatest extends Component {
  render() {
    const { notifications, markAsRead } = this.props;
    const notifCount = notifications.length;

    let seeAll = (
      <NotificationSeeAll>
        <Link to="/notifications">See all</Link>
      </NotificationSeeAll>
    );

    let content = (
      <NotificationArea>
        <NotificationList>
          {notifications.map((notif, key) => (
            <NotificationRow
              notification={notif}
              key={key}
              markAsRead={markAsRead}
            />
          ))}
        </NotificationList>
      </NotificationArea>
    );

    if (notifCount === 0) {
      content = (
        <EmptyState
          icon={<i className="ion-android-notifications" />}
          text="Coming soon.."
          size="small"
        />
      );
      seeAll = null;
    }

    return (
      <NotificationWrapper>
        {content}
        {seeAll}
      </NotificationWrapper>
    );
  }
}

NotificationsLatest.propTypes = {
  notifications: PropTypes.array.isRequired,
  markAsRead: PropTypes.func.isRequired
};

export default NotificationsLatest;
