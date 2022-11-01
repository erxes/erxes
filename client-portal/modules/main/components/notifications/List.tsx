import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';

import FormControl from '../../../common/form/Control';
import { NotificationList } from '../../../styles/main';
import { INotification } from '../../../types';
import Alert from '../../../utils/Alert';
import Row from './Row';

type Props = {
  notifications: INotification[];
  count: number;
  loading: boolean;
  refetch?: () => void;
  markAsRead: (notificationIds?: string[]) => void;
};

const List = (props: Props) => {
  const { loading, notifications, count } = props;

  const [filterUnread, setFilterByUnread] = React.useState(false);

  const filterByUnread = () => {
    setFilterByUnread(!filterUnread);
  }

  const markAllRead = (isPageRead: boolean) => {
    if (!isPageRead) {
      return props.markAsRead();
    }

    const unreadNotifications = notifications.filter(n => !n.isRead);

    if (unreadNotifications.length > 0) {
      props.markAsRead(unreadNotifications.map(n => n._id));
    }

    Alert.success('All notifications are marked as read');
    return;
  }

  const content = (
    <NotificationList>
      {notifications.map((notif, key) => (
        <Row notification={notif} key={key} />
      ))}
    </NotificationList>
  );
  const actionBarLeft = (
    <FormControl
      id="isFilter"
      componentClass="checkbox"
      onClick={filterByUnread}
    >
      {__('Show unread')}
    </FormControl>
  );

  const actionBarRight = (
    <div>
      <Button
        btnStyle="primary"
        size="small"
        onClick={markAllRead.bind(null, false)}
        icon="window-maximize"
      >
        Mark Page Read
      </Button>
      <Button
        btnStyle="success"
        size="small"
        onClick={markAllRead.bind(null, true)}
        icon="eye"
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
      // footer={<Pagination count={count} />}
    />
  );
};

export default List;
