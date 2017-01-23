import React, { PropTypes, Component } from 'react';
import { _ } from 'meteor/underscore';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import Sidebar from '/imports/react-ui/settings/Sidebar.jsx';
import { EmptyState, Pagination } from '/imports/react-ui/common';
import { NotificationListRow } from '../../containers';
import { Wrapper } from '../';


class NotificationList extends Component {
  constructor(props) {
    super(props);

    this.state = { bulk: [] };
    this.markAllRead = this.markAllRead.bind(this);
  }

  markAllRead() {
    const { bulk } = this.state;
    _.each(this.props.notifications, (notification) => {
      if (!notification.isRead) {
        bulk.push(notification._id);
      }
    });
    this.props.markAsRead(this.state.bulk, (error) => {
      if (error) {
        return Alert.error('Error', error.reason);
      }
      return Alert.success('All notifications have been seen');
    });
    this.setState({ bulk: [] });
  }

  render() {
    const notifications = this.props.notifications;
    const notifCount = notifications.length;
    const { loadMore, hasMore } = this.props;

    let content = (
      <Pagination loadMore={loadMore} hasMore={hasMore}>
        <ul className="conversations-list notif-list">
          {
            notifications.map((notif, key) =>
              <NotificationListRow
                notification={notif}
                key={key}
              />,
            )
          }
        </ul>
      </Pagination>
    );

    if (notifCount === 0) {
      content = (
        <EmptyState
          text="No notifications"
          size="full"
          icon={<i className="ion-android-notifications" />}
        />
      );
    }

    const actionBarLeft = (
      <div>
        <Button bsStyle="link" onClick={this.markAllRead}>
          <i className="ion-checkmark-circled" /> Mark all Read
        </Button>
      </div>
    );
    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Notifications' }]} />}
        leftSidebar={<Sidebar />}
        actionBar={actionBar}
        content={content}
      />
    );
  }

}

NotificationList.propTypes = {
  notifications: PropTypes.array.isRequired,
  markAsRead: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

export default NotificationList;
