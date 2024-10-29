import { Alert, __, router } from "coreui/utils";

import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import FormControl from "@erxes/ui/src/components/form/Control";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { INotification } from "@erxes/ui-notifications/src/types";
import React, { useState } from "react";
import { NotifList } from "@erxes/ui-notifications/src/components/styles";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationRow from "@erxes/ui-notifications/src/components/NotificationRow";

type Props = {
  notifications: INotification[];
  markAsRead: (notificationIds?: string[]) => void;
  loading: boolean;
  count: number;
};

const NotificationList = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { notifications, markAsRead, loading, count } = props;

  const [filterByUnread, setFilterByUnread] = useState<boolean>(true);

  const markAllRead = (isPageRead) => {
    if (!isPageRead) {
      return markAsRead();
    }

    const unreadNotifications: string[] = [];

    notifications.forEach((notification) => {
      if (!notification.isRead) {
        unreadNotifications.push(notification._id);
      }
    });

    if (unreadNotifications.length === 0) {
      Alert.success("This page has no notification");
      return;
    }

    markAsRead(unreadNotifications);
  };

  const handleFilterByUnread = () => {
    setFilterByUnread(!filterByUnread);
    router.setParams(navigate, location, { requireRead: filterByUnread });
  };

  const renderContent = () => {
    return (
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
  };

  const renderActionBar = () => {
    const actionBarLeft = (
      <FormControl
        id="isFilter"
        componentclass="checkbox"
        onClick={handleFilterByUnread}
      >
        <label htmlFor="isFilter">{__("Show unread")}</label>
      </FormControl>
    );

    const actionBarRight = (
      <div>
        <Button
          btnStyle="primary"
          onClick={markAllRead.bind(this, true)}
          icon="window-maximize"
        >
          Mark Page Read
        </Button>
        <Button
          btnStyle="success"
          onClick={markAllRead.bind(this, false)}
          icon="eye"
        >
          Mark All Read
        </Button>
      </div>
    );

    return <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />;
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Notifications")}
          breadcrumb={[{ title: __("Notifications") }]}
        />
      }
      actionBar={renderActionBar()}
      content={
        <DataWithLoader
          data={renderContent()}
          loading={loading}
          count={count}
          emptyText={__("Looks like you are all caught up!")}
          emptyImage="/images/actions/17.svg"
        />
      }
      hasBorder={true}
      footer={<Pagination count={count} />}
    />
  );
};

export default NotificationList;
