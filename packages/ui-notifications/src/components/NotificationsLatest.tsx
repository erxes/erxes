import EmptyState from "@erxes/ui/src/components/EmptyState";
import Spinner from "@erxes/ui/src/components/Spinner";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import { Link } from "react-router-dom";
import { INotification } from "../types";
import NotificationRow from "./NotificationRow";
import {
  MarkAllRead,
  NotificationList,
  NotificationSeeAll,
  NotificationWrapper,
  PopoverContent,
} from "./styles";

type Props = {
  notifications: INotification[];
  markAsRead: (notificationIds?: string[]) => void;
  isLoading: boolean;
};

class NotificationsLatest extends React.Component<Props> {
  render() {
    const { notifications, markAsRead, isLoading } = this.props;

    if (isLoading) {
      return <Spinner objective={true} />;
    }

    const mainContent = (
      <React.Fragment>
        <NotificationList>
          {(notifications || []).map((notif, key) => (
            <NotificationRow
              notification={notif}
              key={key}
              markAsRead={markAsRead}
            />
          ))}
        </NotificationList>
        <NotificationSeeAll>
          <Link to="/notifications">{__("See all")}</Link>
        </NotificationSeeAll>
        <MarkAllRead>
          <span onClick={markAsRead.bind(this, [])}>
            {__("Mark all as read")}
          </span>{" "}
        </MarkAllRead>
      </React.Fragment>
    );

    const emptyContent = (
      <PopoverContent>
        <EmptyState
          text={__("Looks like you are all caught up")}
          image="/images/actions/17.svg"
        />
      </PopoverContent>
    );

    const content = () => {
      if ((notifications || []).length === 0) {
        return emptyContent;
      }

      return <NotificationWrapper>{mainContent}</NotificationWrapper>;
    };

    return content();
  }
}

export default NotificationsLatest;
