import React, { PropTypes, Component } from 'react';
import { NotificationListRow } from '../../containers';
import { Button } from 'react-bootstrap';
import { Wrapper } from '../';
import { EmptyState } from '/imports/react-ui/common';
import Sidebar from '/imports/react-ui/settings/Sidebar.jsx';


class NotificationList extends Component {
  constructor(props) {
    super(props);

    this.state = { bulk: [] };
    this.markAsRead = this.markAsRead.bind(this);
    this.toggleBulk = this.toggleBulk.bind(this);
  }

  markAsRead() {
    this.props.markAsRead(this.state.bulk);
    this.setState({ bulk: [] });
  }

  toggleBulk(notificationId, toAdd) {
    const { bulk } = this.state;
    const index = bulk.indexOf(notificationId);

    if (toAdd) {
      if (index < 0) {
        bulk.push(notificationId);
      }
    } else {
      if (index > -1) {
        bulk.splice(index, 1);
      }
    }

    this.setState({ bulk });
  }

  render() {
    const notifications = this.props.notifications;
    const notifCount = notifications.length;

    let content = (
      <ul className="conversations-list notif-list">
        {
          notifications.map((notif, key) =>
            <NotificationListRow
              toggleBulk={this.toggleBulk}
              notification={notif}
              key={key}
            />
          )
        }
      </ul>
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
        <Button bsStyle="link" onClick={this.markAsRead}>
          <i className="ion-checkmark-circled" /> Mark as read
        </Button>
      </div>
    );
    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={[{ title: 'Notifications' }]} />}
        leftSidebar={<Sidebar />}
        actionBar={this.state.bulk.length ? actionBar : false}
        content={content}
      />
    );
  }

}

NotificationList.propTypes = {
  notifications: PropTypes.array.isRequired,
  markAsRead: PropTypes.func.isRequired,
};

export default NotificationList;
