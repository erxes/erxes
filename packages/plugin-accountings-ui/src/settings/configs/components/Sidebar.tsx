import {
  Sidebar as LeftSidebar,
  SidebarList as List,
} from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

const Sidebar = () => {
  const renderListItem = (url: string, text: string) => {
    return (
      <li>
        <Link
          to={url}
          className={window.location.href.includes(url) ? 'active' : ''}
        >
          {__(text)}
        </Link>
      </li>
    );
  };

  return (
    <LeftSidebar header={<SidebarHeader />} hasBorder>
      <List id="SettingsSidebar">
        {renderListItem('/accountings/configs', 'Main config')}
      </List>
      <List id="SettingsSidebar">
        {renderListItem('/accountings/vat-rows', 'VAT rows')}
      </List>
      <List id="SettingsSidebar">
        {renderListItem('/accountings/ctax-rows', 'CTAX rows')}
      </List>
    </LeftSidebar>
  );
};

export default Sidebar;
