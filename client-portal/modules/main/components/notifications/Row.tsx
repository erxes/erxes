import { AvatarSection, CreatedUser } from "../../../styles/notifications";
import { CreatedDate, InfoSection } from "../../../styles/main";

import { INotification } from "../../../types";
import NameCard from "../../../common/nameCard/NameCard";
import React from "react";
import classNames from "classnames";
import dayjs from "dayjs";

type Props = {
  notification: INotification;
  onClickNotification: (notificationId: string) => void;
  //   remove: (_id: string) => void;
};

const Row = (props: Props) => {
  const { notification } = props;
  // const router = useRouter()

  const gotoDetail = () => {
    props.onClickNotification(notification._id);
    // router.push(`/notification/${notification._id}`)
  };

  const classes = classNames({ unread: !notification.isRead });

  const renderCreatedUser = () => {
    const { createdUser, content } = notification;

    let name = "system";

    if (createdUser) {
      name = createdUser.details
        ? createdUser.details.fullName || ""
        : createdUser.username || createdUser.email;
    }

    const getCardType = (content.split(" ")[0] || "").toLocaleLowerCase();

    const createTitle = `has updated ${getCardType}`;
    return (
      <CreatedUser>
        {name} {createTitle}
      </CreatedUser>
    );
  };

  return (
    <li className={classes} onClick={gotoDetail}>
      <AvatarSection>
        <NameCard.Avatar user={notification.createdUser} size={30} />
      </AvatarSection>
      <InfoSection>
        {renderCreatedUser()}
        <p>{notification.content || "New notification"}</p>
        <CreatedDate>
          {dayjs(notification.createdAt).format("DD MMM YYYY, HH:mm")}
        </CreatedDate>
      </InfoSection>
    </li>
  );
};

export default Row;
