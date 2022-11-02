import React from 'react';
import Button from '../../../common/Button';

import FormControl from '../../../common/form/Control';
import { NotificationList } from '../../../styles/main';
import { TabContainers, TabTitle, Wrapper } from '../../../styles/tasks';
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
  onClickNotification: (notificationId: string) => void;
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

  const renderContent = () => {
    if (notifications.length === 0) {
      return (
        <Wrapper>
          <h4>Looks like you are all caught up!</h4>
        </Wrapper>
      );
    }

    return (
      <>
        <NotificationList>
          {notifications.map((notif, key) => (
            <Row notification={notif} key={key} onClickNotification={props.onClickNotification} />
          ))}
        </NotificationList>
      </>
    );
  };

  return renderContent();

  // return (
  //   <TabContainers>
  //       {stages.map((stage) => (
  //         <TabTitle
  //           key={stage._id}
  //           active={stageId === stage._id}
  //           color={getConfigColor(config, "activeTabColor")}
  //         >
  //           <Link href={`/tasks?stageId=${stage._id}`}>{stage.name}</Link>
  //         </TabTitle>
  //       ))}
  //     </TabContainers>
  // )
};

export default List;
