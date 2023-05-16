import { TabContainers, TabTitle } from "../../../styles/tasks";

import { IUser } from "../../../types";
import Notifications from "../../containers/notifications/List";
import React from "react";
import { getConfigColor } from "../../../common/utils";

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
      {/* <TabContainers>
        {tabTitles.map((title) => (
          <TabTitle
            key={title}
            active={currentTab === title}
            color={getConfigColor(config, 'activeTabColor')}
            onClick={() => setCurrentTab(title)}
          >
            {title}
          </TabTitle>
        ))}
      </TabContainers> */}

      <Notifications
        count={count}
        currentUser={currentUser}
        requireRead={requireRead}
      />
    </>
  );
};

export default List;
