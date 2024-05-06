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
    <LeftSidebar header={<SidebarHeader />} hasBorder={true}>
      <List id="SettingsSidebar">
        {renderListItem(
          '/erxes-plugin-product-places/settings/stage',
          'Stage in products places config',
        )}
        {renderListItem(
          '/erxes-plugin-product-places/settings/split',
          'Stage in products splits config',
        )}
        {renderListItem(
          '/erxes-plugin-product-places/settings/print',
          'Stage in products prints config',
        )}
      </List>
    </LeftSidebar>
  );
};

export default Sidebar;
