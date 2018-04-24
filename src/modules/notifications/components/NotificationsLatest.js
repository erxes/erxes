import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { EmptyState } from 'modules/common/components';
import { Link } from 'react-router-dom';
import {
  NotificationSeeAll,
  NotificationList,
  NotificationWrapper,
  PopoverContent
} from './styles';
import { NotificationRow } from './';

class NotificationsLatest extends Component {
  componentDidMount() {
    // update popover position
    this.props.update();
  }

  render() {
    const { notifications, markAsRead } = this.props;
    const notifCount = notifications.length;
    const { __ } = this.context;

    const mainContent = (
      <Fragment>
        <NotificationList>
          {notifications.map((notif, key) => (
            <NotificationRow
              notification={notif}
              key={key}
              markAsRead={markAsRead}
            />
          ))}
        </NotificationList>
        <NotificationSeeAll>
          <Link to="/notifications">{__('See all')}</Link>
        </NotificationSeeAll>
      </Fragment>
    );

    const emptyContent = (
      <PopoverContent>
        <EmptyState
          text={__('Coming soon')}
          image="/images/robots/robot-05.svg"
        />
      </PopoverContent>
    );

    const content = () => {
      if (notifCount === 0) {
        return emptyContent;
      }
      return <NotificationWrapper>{mainContent}</NotificationWrapper>;
    };

    return content();
  }
}

NotificationsLatest.propTypes = {
  notifications: PropTypes.array.isRequired,
  markAsRead: PropTypes.func.isRequired,
  update: PropTypes.func
};

NotificationsLatest.contextTypes = {
  __: PropTypes.func
};

export default NotificationsLatest;
