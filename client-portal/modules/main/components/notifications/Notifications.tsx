import { IUser } from "../../../types";
import Notifications from "../../containers/notifications/List";
import React from "react";

type Props = {
  count: number;
  currentUser: IUser;
  config: any;
};

const List = (props: Props) => {
  const { config, count, currentUser } = props;

  const [currentTab, setCurrentTab] = React.useState("Recent");

  const tabTitles = ["Recent", "Unread"];

  const requireRead = currentTab === "Unread";

  return (
    <>
      <Notifications
        count={count}
        currentUser={currentUser}
        requireRead={requireRead}
      />
    </>
  );
};

export default List;
