import React from 'react';
import Button from '../../../common/Button';

import FormControl from '../../../common/form/Control';
import { NotificationList } from '../../../styles/main';
import { Wrapper } from '../../../styles/tasks';
import { INotification } from '../../../types';
import Alert from '../../../utils/Alert';
import DataWithLoader from '../DataWithLoader';
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
  };

  const markAllRead = (isPageRead: boolean) => {
    if (!isPageRead) {
      return props.markAsRead();
    }

    const unreadNotifications = notifications.filter((n) => !n.isRead);

    if (unreadNotifications.length > 0) {
      props.markAsRead(unreadNotifications.map((n) => n._id));
    }

    Alert.success('All notifications are marked as read');
    return;
  };

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
      {'Show unread'}
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

  return (
    <DataWithLoader
      data={content}
      loading={loading}
      count={count}
      emptyText="Looks like you are all caught up!"
      emptyImage="/images/actions/17.svg"
    />
  );
};

export default List;
