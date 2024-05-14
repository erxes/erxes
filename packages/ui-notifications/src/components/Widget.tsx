import React, { useState } from "react";
import { TabTitle, Tabs } from "@erxes/ui/src/components/tabs";

import { INotification } from "../types";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import Label from "@erxes/ui/src/components/Label";
import { NotifButton } from "./styles";
import NotificationsLatest from "./NotificationsLatest";
import Popover from "@erxes/ui/src/components/Popover";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  unreadCount: number;
  notifications: INotification[];
  showNotifications: (requireRead: boolean) => void;
  markAsRead: (notificationIds?: string[]) => void;
  isLoading: boolean;
  currentUser?: IUser;
};

const Widget = (props: Props) => {
  const {
    unreadCount,
    currentUser,
    notifications,
    isLoading,
    showNotifications,
    markAsRead,
  } = props;

  const popoverProps = {
    notifications,
    isLoading,
    markAsRead,
  };

  const [currentTab, setCurrentTab] = useState("Recent");

  const renderUnreadCount = () => {
    const user = currentUser || { isShowNotification: false };

    if (!user.isShowNotification && unreadCount && unreadCount !== 0) {
      return (
        <Label shake={true} ignoreTrans={true}>
          {unreadCount}
        </Label>
      );
    }

    return null;
  };

  const onTabClick = (currentTab) => {
    setCurrentTab(currentTab);
  };

  const recentOnClick = () => {
    onTabClick("Recent");
    showNotifications(false);
  };

  const unreadOnClick = () => {
    onTabClick("Unread");
    showNotifications(true);
  };

  return (
    <Popover
      trigger={
        <NotifButton>
          <Tip text={__("Notifications")} placement="bottom">
            <Icon icon="bell" size={20} />
          </Tip>
          {renderUnreadCount()}
        </NotifButton>
      }
      placement="bottom"
      className="notification-popover"
    >
      <Tabs full={true}>
        <TabTitle
          className={currentTab === "Recent" ? "active" : ""}
          onClick={recentOnClick}
        >
          {__("Recent")}
        </TabTitle>
        <TabTitle
          className={currentTab === "Unread" ? "active" : ""}
          onClick={unreadOnClick}
        >
          {__("Unread")}
        </TabTitle>
      </Tabs>
      <NotificationsLatest {...popoverProps} />
    </Popover>
  );
};

export default Widget;
