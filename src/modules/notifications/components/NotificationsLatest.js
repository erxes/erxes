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
    const { __ } = this.context;

    const mainContent = (
      <div>
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
        <NotificationSeeAll>
          <Link to="/notifications">{__('See all')}</Link>
        </NotificationSeeAll>
      </div>
    );

    const emptyContent = (
      <EmptyState
        icon="android-notifications"
        text="Coming soon.."
        size="small"
      />
    );

    const content = () => {
      if (notifCount === 0) {
        return emptyContent;
      }
      return mainContent;
    };

    return <NotificationWrapper>{content()}</NotificationWrapper>;
  }
}

NotificationsLatest.propTypes = {
  notifications: PropTypes.array.isRequired,
  markAsRead: PropTypes.func.isRequired
};

NotificationsLatest.contextTypes = {
  __: PropTypes.func
};

export default NotificationsLatest;
