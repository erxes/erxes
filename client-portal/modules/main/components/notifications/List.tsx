import { INotification, IUser } from "../../../types";
import { NotificationHeader, NotificationList } from "../../../styles/main";

import Alert from "../../../utils/Alert";
import EmptyState from "../../../common/form/EmptyState";
import Modal from "../../../common/Modal";
import NotificationDetail from "../../containers/notifications/Detail";
import React from "react";
import Row from "./Row";
import Spinner from "../../../common/Spinner";
import { Wrapper } from "../../../styles/tasks";

type Props = {
  currentUser: IUser;
  notifications: INotification[];
  count: number;
  loading: boolean;
  refetch?: () => void;
  onClickNotification: (notificationId: string) => void;
};

const List = (props: Props) => {
  const { notifications, loading } = props;

  const [showModal, setShowModal] = React.useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = React.useState(
    ""
  );

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
