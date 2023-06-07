import { INotification, IUser } from '../../../types';
import { NotificationList } from '../../../styles/main';

import EmptyState from '../../../common/form/EmptyState';
import Modal from '../../../common/Modal';
import NotificationDetail from '../../containers/notifications/Detail';
import React, { useState } from 'react';
import Row from './Row';
import Spinner from '../../../common/Spinner';
import {
  NotificationSeeAll,
  MarkAllRead,
  NotificationWrapper,
  TabContainer,
  TabCaption
} from '../../../styles/notifications';
import { __ } from '../../../../utils';

type Props = {
  currentUser: IUser;
  notifications: INotification[];
  count: number;
  loading: boolean;
  refetch?: () => void;
  markAsRead: (notificationIds?: string[]) => void;
  markAllAsRead: any;
  showNotifications: (requireRead: boolean) => void;
};

const List = (props: Props) => {
  const {
    notifications,
    loading,
    count,
    markAsRead,
    markAllAsRead,
    showNotifications
  } = props;

  const [currentTab, setCurrentTab] = useState('Recent');
  const [showModal, setShowModal] = React.useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = React.useState(
    ''
  );

  const onTabClick = currTab => {
    setCurrentTab(currTab);
  };

  const recentOnClick = () => {
    onTabClick('Recent');
    showNotifications(false);
  };

  const unreadOnClick = () => {
    onTabClick('Unread');
    showNotifications(true);
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner objective={true} />;
    }

    if (!notifications || notifications.length === 0) {
      return (
        <EmptyState
          icon="ban"
          text="Looks like you are all caught up!"
          size="small"
        />
      );
    }

    const onClick = (notificationId: string) => {
      markAsRead([notificationId]);
      setSelectedNotificationId(notificationId);
      setShowModal(true);
    };

    return (
      <React.Fragment>
        <NotificationList>
          {notifications.map((notif, key) => (
            <Row notification={notif} key={key} onClickNotification={onClick} />
          ))}
        </NotificationList>

        <NotificationSeeAll>
          <span>{__('See all')}</span>
        </NotificationSeeAll>
        <MarkAllRead>
          <span onClick={markAllAsRead}>{__('Mark all as read')}</span>{' '}
        </MarkAllRead>

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
      </React.Fragment>
    );
  };

  return (
    <>
      <TabContainer full={true}>
        <TabCaption
          className={currentTab === 'Recent' ? 'active' : ''}
          onClick={recentOnClick}
        >
          {__('Recent')}
        </TabCaption>
        <TabCaption
          className={currentTab === 'Unread' ? 'active' : ''}
          onClick={unreadOnClick}
        >
          {__('Unread')}
        </TabCaption>
      </TabContainer>
      <NotificationWrapper>{renderContent()}</NotificationWrapper>
    </>
  );
};

export default List;
