import {
  Button,
  Sidebar as LeftSidebar,
  SidebarList as List,
  MainStyleTopHeader as TopHeader
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
          "/erxes-plugin-loan/main-settings",
          __("Loan settings")
        )}
        {renderListItem(
          "/erxes-plugin-loan/loss-settings",
          __("Loan not calc loss settings")
        )}
        {renderListItem(
          "/erxes-plugin-loan/holiday-settings",
          __("Holiday configs")
        )}
        {renderListItem(
          "/erxes-plugin-loan/credit-settings",
          __("Credit configs")
        )}
      </List>
    </LeftSidebar>
  );
};

export default Sidebar;
