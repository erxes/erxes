import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Sidebar from 'modules/settings/Sidebar';
import {
  Button,
  Icon,
  EmptyState,
  Pagination
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import { NotificationListRow } from './';
import { NotifList } from './styles';

class NotificationList extends Component {
  constructor(props) {
    super(props);

    this.state = { bulk: [] };
  }

  markAllRead(isPageRead) {
    if (!isPageRead) {
      return this.props.markAsRead();
    }

    const { bulk } = this.state;

    _.each(this.props.notifications, notification => {
      if (!notification.isRead) {
        bulk.push(notification._id);
      }
    });

    this.props.markAsRead(this.state.bulk);

    this.setState({ bulk: [] });
  }

  render() {
    const { notifications, count, markAsRead } = this.props;
    const notifCount = notifications.length;

    const mainContent = (
      <NotifList>
        {notifications.map((notif, key) => (
          <NotificationListRow
            notification={notif}
            key={key}
            markAsRead={markAsRead}
          />
        ))}
      </NotifList>
    );

    const emptyContent = (
      <EmptyState
        text="No notifications"
        size="full"
        icon="android-notifications"
      />
    );

    const content = () => {
      if (notifCount === 0) {
        return emptyContent;
      }
      return mainContent;
    };

    const actionBarLeft = (
      <div>
        <Button
          btnStyle="primary"
          size="small"
          onClick={this.markAllRead.bind(this, true)}
        >
          <Icon icon="checkmark" /> Mark Page Read
        </Button>
        <Button
          btnStyle="success"
          size="small"
          onClick={this.markAllRead.bind(this, false)}
        >
          <Icon icon="checkmark" /> Mark All Read
        </Button>
      </div>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Notifications' }]} />}
        leftSidebar={<Sidebar />}
        actionBar={actionBar}
        content={content()}
        footer={<Pagination count={count} />}
      />
    );
  }
}

NotificationList.propTypes = {
  notifications: PropTypes.array.isRequired,
  markAsRead: PropTypes.func.isRequired,
  count: PropTypes.number.isRequired
};

export default NotificationList;
