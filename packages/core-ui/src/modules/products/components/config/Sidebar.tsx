import {
  Sidebar as LeftSidebar,
  SidebarList as List
} from "@erxes/ui/src/layout";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import { Link } from "react-router-dom";
import SidebarHeader from "@erxes/ui-settings/src/common/components/SidebarHeader";

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

  return (
    <LeftSidebar header={<SidebarHeader />} hasBorder>
      <List id="SettingsSidebar">
        {renderListItem("/settings/uoms-manage", "Uoms manage")}
      </List>
      <List id="SettingsSidebar">
        {renderListItem("/settings/products-config", "General config")}
      </List>
      <List id="SettingsSidebar">
        {renderListItem("/settings/similarity-group", "Similarity Group")}
      </List>
      <List id="SettingsSidebar">
        {renderListItem("/settings/bundle-condition", "Bundle Condition")}
      </List>
      <List id="SettingsSidebar">
        {renderListItem("/settings/bundle-rule", "Bundle Rule")}
      </List>
      <List id="SettingsSidebar">
        {renderListItem("/settings/product-rule", "Product Rule")}
      </List>
    </LeftSidebar>
  );
};

export default Sidebar;
