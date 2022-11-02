import React from 'react';

import Modal from '../../../common/Modal';
import { NotificationList } from '../../../styles/main';
import { Wrapper } from '../../../styles/tasks';
import { INotification, IUser } from '../../../types';
import Alert from '../../../utils/Alert';
import NotificationDetail from '../../containers/notifications/Detail';
import Row from './Row';

type Props = {
  currentUser: IUser;
  notifications: INotification[];
  count: number;
  loading: boolean;
  refetch?: () => void;
  markAsRead: (notificationIds?: string[]) => void;
  onClickNotification: (notificationId: string) => void;
};

const List = (props: Props) => {
  const { notifications } = props;

  const [showModal, setShowModal] = React.useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = React.useState(
    ''
  );

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

  const renderContent = () => {
    if (notifications.length === 0) {
      return (
        <Wrapper>
          <h4>Looks like you are all caught up!</h4>
        </Wrapper>
      );
    }

    const onClick = (notificationId: string) => {
      props.onClickNotification(notificationId);
      setSelectedNotificationId(notificationId);
      setShowModal(true);
    };

    return (
      <>
        <NotificationList>
          {notifications.map((notif, key) => (
            <Row notification={notif} key={key} onClickNotification={onClick} />
          ))}
        </NotificationList>

        <Modal
          content={() => (
            <NotificationDetail
              _id={selectedNotificationId}
              currentUser={props.currentUser}
              afterRemove={() => {
                setShowModal(false);
                props.refetch && props.refetch();
              }}
            />
          )}
          onClose={() => setShowModal(false)}
          isOpen={showModal}
        />
      </>
    );
  };

  return renderContent();
};

export default List;
