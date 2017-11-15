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
    this.markAllRead = this.markAllRead.bind(this);
  }

  markAllRead() {
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

    let content = (
      <NotifList className="conversations-list">
        {notifications.map((notif, key) => (
          <NotificationListRow
            notification={notif}
            key={key}
            markAsRead={markAsRead}
          />
        ))}
      </NotifList>
    );

    if (notifCount === 0) {
      content = (
        <EmptyState
          text="No notifications"
          size="full"
          icon={<Icon icon="android-notifications" />}
        />
      );
    }

    const actionBarLeft = (
      <Button bsStyle="link" onClick={this.markAllRead}>
        <Icon icon="checkmark-circled" /> Mark all Read
      </Button>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Notifications' }]} />}
        leftSidebar={<Sidebar />}
        actionBar={actionBar}
        content={content}
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
