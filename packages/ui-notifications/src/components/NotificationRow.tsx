import {
  AvatarSection,
  Content,
  CreatedDate,
  CreatedUser,
  InfoSection,
} from "./styles";

import { INotification } from "../types";
import { IUser } from "@erxes/ui/src/auth/types";
import NameCard from "@erxes/ui/src/components/nameCard/NameCard";
import React from "react";
import RoundedBackgroundIcon from "@erxes/ui/src/components/RoundedBackgroundIcon";
import classNames from "classnames";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import xss from "xss";

type Props = {
  notification: INotification;
  markAsRead: (notificationIds?: string[]) => void;
  createdUser?: IUser;
  isList?: boolean;
};

const NotificationRow = (props: Props) => {
  const navigate = useNavigate();
  const { notification, isList, markAsRead } = props;
  const { isRead, createdUser, notifType } = notification;
  const classes = classNames({ unread: !isRead });

  const getIcon = () => {
    let icon = "user-check";

    if (notifType?.includes("conversation")) {
      icon = "comment-1";
    }

    if (notifType?.includes("deal")) {
      icon = "dollar-alt";
    }

    if (notifType?.includes("ticket")) {
      icon = "postcard";
    }

    if (notifType?.includes("task")) {
      icon = "file-check";
    }
    if (notifType?.includes("purchase")) {
      icon = "dollar-alt";
    }

    return icon;
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      markAsRead([notification._id]);
    }

    const params = notification.link.split("?");

    navigate(
      {
        pathname: params[0],
        search: `?${params[1]}`,
      },
      { state: { from: "notification" }, replace: true }
    );
  };

  const renderContent = (content: string, type: string) => {
    if (!type?.includes("conversation")) {
      return <b> {content}</b>;
    }

    return (
      <Content
        dangerouslySetInnerHTML={{ __html: xss(content) }}
        isList={isList}
      />
    );
  };

  const renderCreatedUser = () => {
    let name = "system";

    if (createdUser) {
      name = createdUser.details
        ? createdUser.details.fullName || ""
        : createdUser.username || createdUser.email;
    }

    return (
      <CreatedUser isList={isList}>
        {name}
        <span>
          {notification.action}
          {renderContent(notification.content, notification.notifType)}
        </span>
      </CreatedUser>
    );
  };

  return (
    <li className={classes} onClick={handleMarkAsRead}>
      <AvatarSection>
        <NameCard.Avatar
          user={createdUser}
          size={30}
          icon={<RoundedBackgroundIcon icon={getIcon()} />}
        />
      </AvatarSection>
      <InfoSection>
        {renderCreatedUser()}
        <CreatedDate isList={isList}>
          {dayjs(notification.date).format("DD MMM YYYY, HH:mm")}
        </CreatedDate>
      </InfoSection>
    </li>
  );
};

export default NotificationRow;
