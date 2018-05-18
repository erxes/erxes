import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Sidebar from 'modules/settings/Sidebar';
import { Button, Pagination } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import { NotificationRow } from './';
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

    this.props.notifications.forEach(notification => {
      if (!notification.isRead) {
        bulk.push(notification._id);
      }
    });

    this.props.markAsRead(this.state.bulk);

    this.setState({ bulk: [] });
  }

  render() {
    const { notifications, count, markAsRead } = this.props;
    const { __ } = this.context;

    const content = (
      <NotifList>
        {notifications.map((notif, key) => (
          <NotificationRow
            notification={notif}
            key={key}
            markAsRead={markAsRead}
          />
        ))}
      </NotifList>
    );

    const actionBarRight = (
      <div>
        <Button
          btnStyle="primary"
          size="small"
          onClick={this.markAllRead.bind(this, true)}
          icon="checked-1"
        >
          Mark Page Read
        </Button>
        <Button
          btnStyle="success"
          size="small"
          onClick={this.markAllRead.bind(this, false)}
          icon="checked-1"
        >
          Mark All Read
        </Button>
      </div>
    );

    const actionBar = <Wrapper.ActionBar right={actionBarRight} />;

    return (
      <Wrapper
        header={
          <Wrapper.Header breadcrumb={[{ title: __('Notifications') }]} />
        }
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

NotificationList.contextTypes = {
  __: PropTypes.func
};

export default NotificationList;
