import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import FormControl from 'modules/common/components/form/Control';
import Pagination from 'modules/common/components/pagination/Pagination';
import { __, Alert, router } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { INotification } from 'modules/notifications/types';
import React from 'react';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import NotificationRow from './NotificationRow';
import { NotifList } from './styles';

type Props = {
  notifications: INotification[];
  markAsRead: (notificationIds?: string[]) => void;
  loading: boolean;
  count: number;
} & IRouterProps;

type State = {
  filterByUnread: boolean;
};

class NotificationList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { filterByUnread: true };
  }

  markAllRead = isPageRead => {
    if (!isPageRead) {
      return this.props.markAsRead();
    }

    const unreadNotifications: string[] = [];

    this.props.notifications.forEach(notification => {
      if (!notification.isRead) {
        unreadNotifications.push(notification._id);
      }
    });

    if (unreadNotifications.length === 0) {
      Alert.success('This page has no notification');
      return;
    }

    this.props.markAsRead(unreadNotifications);
  };

  filterByUnread = () => {
    const { filterByUnread } = this.state;

    this.setState({ filterByUnread: !filterByUnread }, () => {
      router.setParams(this.props.history, { requireRead: filterByUnread });
    });
  };

  render() {
    const { notifications, count, markAsRead, loading } = this.props;

    const content = (
      <NotifList>
        {notifications.map((notif, key) => (
          <NotificationRow
            notification={notif}
            key={key}
            markAsRead={markAsRead}
            isList={true}
          />
        ))}
      </NotifList>
    );

    const actionBarLeft = (
      <FormControl
        id="isFilter"
        componentClass="checkbox"
        onClick={this.filterByUnread}
      >
        {__('Show unread')}
      </FormControl>
    );

    const actionBarRight = (
      <div>
        <Button
          btnStyle="primary"
          size="small"
          onClick={this.markAllRead.bind(this, true)}
          icon="window-maximize"
        >
          Mark Page Read
        </Button>
        <Button
          btnStyle="success"
          size="small"
          onClick={this.markAllRead.bind(this, false)}
          icon="eye-2"
        >
          Mark All Read
        </Button>
      </div>
    );

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Notifications')}
            breadcrumb={[{ title: __('Notifications') }]}
          />
        }
        actionBar={actionBar}
        content={
          <DataWithLoader
            data={content}
            loading={loading}
            count={count}
            emptyText="Looks like you are all caught up!"
            emptyImage="/images/actions/17.svg"
          />
        }
        center={true}
        footer={<Pagination count={count} />}
      />
    );
  }
}

export default withRouter<Props>(NotificationList);
