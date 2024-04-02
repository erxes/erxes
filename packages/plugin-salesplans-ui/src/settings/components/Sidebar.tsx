import { SidebarList as List } from "@erxes/ui/src/layout";
import { Wrapper } from "@erxes/ui/src/layout";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  children: any;
  queryParams: any;
};

const Sidebar = (props: Props) => {
  const Children = props.children;

  const renderListItem = (url: string, text: string) => {
    return (
      <li>
        <Link
          to={url}
          className={window.location.href.includes(url) ? "active" : ""}
        >
          {__(text)}
        </Link>
      </li>
    );
  };

  return (
    <Wrapper.Sidebar hasBorder>
      <List id="SettingsSidebar">
        {renderListItem("/salesplans/labels", "Manage Day tag")}
        {renderListItem("/salesplans/timeframes", "Manage Day interval")}
      </List>
      <Children {...props} />
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
