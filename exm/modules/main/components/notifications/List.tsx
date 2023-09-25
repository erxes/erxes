import { IUser } from "../../../types";
import Modal from "../../../common/Modal";
import NotificationDetail from "../../containers/notifications/Detail";
import { NotificationList } from "../../../styles/main";
import React from "react";
import Row from "./Row";
import { Wrapper } from "../../../styles/tasks";

type Props = {
  currentUser: IUser;
  notifications: any[];
  count: number;
  loading: boolean;
  refetch?: () => void;
  onClickNotification: (notificationId: string) => void;
};

const List = (props: Props) => {
  const { notifications } = props;

  const [showModal, setShowModal] = React.useState(false);
  const [selectedNotificationId, setSelectedNotificationId] =
    React.useState("");

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
                // tslint:disable-next-line:no-unused-expression
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
