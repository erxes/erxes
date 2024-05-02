import {
  Button,
  Sidebar as LeftSidebar,
  SidebarList as List,
  MainStyleTopHeader as TopHeader,
} from "@erxes/ui/src";

import { Link } from "react-router-dom";
import React from "react";
import { __ } from "coreui/utils";

const Sidebar = () => {
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

  const renderSidebarHeader = () => {
    return (
      <TopHeader>
        <Link to="/settings/">
          <Button
            btnStyle="simple"
            icon="arrow-circle-left"
            block={true}
            uppercase={false}
          >
            {__("Back to Settings")}
          </Button>
        </Link>
      </TopHeader>
    );
  };

  return (
    <LeftSidebar full={true} header={renderSidebarHeader()}>
      <List id="SettingsSidebar">
        {renderListItem(
          "/erxes-plugin-saving/saving-settings",
          __("Main configs")
        )}
      </List>
    </LeftSidebar>
  );
};

export default Sidebar;
