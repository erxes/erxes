import { INotification, IUser } from '../../../types';
import { NotificationHeader, NotificationList } from '../../../styles/main';

import EmptyState from '../../../common/form/EmptyState';
import Modal from '../../../common/Modal';
import NotificationDetail from '../../containers/notifications/Detail';
import React from 'react';
import Row from './Row';
import Spinner from '../../../common/Spinner';
import {
  NotificationSeeAll,
  MarkAllRead,
  NotificationWrapper
} from '../../../styles/notifications';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { __ } from '../../../../utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

type Props = {
  currentUser: IUser;
  notifications: INotification[];
  count: number;
  loading: boolean;
  refetch?: () => void;
  markAsRead: (notificationIds?: string[]) => void;
};

const List = (props: Props) => {
  const { notifications, loading, markAsRead } = props;

  const [showModal, setShowModal] = React.useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = React.useState(
    ''
  );

  // const seeAllNotifications = asyncComponent(
  //   () =>
  //     import(
  //       /* webpackChunkName: "NotificationList"  */ './containers/NotificationList'
  //     )
  // );

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
      props.markAsRead([notificationId]);
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
          <Router>
            <Link to="/notifications">{__('See all')}</Link>
          </Router>
        </NotificationSeeAll>
        <MarkAllRead>
          <span onClick={markAsRead.bind(this, [])}>
            {__('Mark all as read')}
          </span>{' '}
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
      <NotificationHeader className="d-flex align-items-center justify-content-between">
        <h5>Notifications</h5>
        <span>0 New</span>
      </NotificationHeader>
      {renderContent()}
    </>
  );
};

export default List;
