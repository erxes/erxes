import { Button, Pagination } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { INotification } from 'modules/notifications/types';
import * as React from 'react';
import { NotificationRow } from './';
import { NotifList } from './styles';

type Props = {
  notifications: INotification[];
  markAsRead: (notificationIds?: string[]) => void;
  count: number;
};

class NotificationList extends React.Component<Props, { bulk: string[] }> {
  constructor(props) {
    super(props);

    this.state = { bulk: [] };
  }

  markAllRead = isPageRead => {
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
  };

  render() {
    const { notifications, count, markAsRead } = this.props;

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
          <Wrapper.Header
            title={__('Notifications')}
            breadcrumb={[{ title: __('Notifications') }]}
          />
        }
        actionBar={actionBar}
        content={content}
        center={true}
        footer={<Pagination count={count} />}
      />
    );
  }
}

export default NotificationList;
