import {
  Sidebar as LeftSidebar,
  SidebarList as List,
} from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

const Sidebar: React.FC = () => {
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
          '/erxes-plugin-ebarimt/settings/general',
          'General config',
        )}
        {renderListItem(
          '/erxes-plugin-ebarimt/settings/stage',
          'Stage in Ebarimt config',
        )}
        {renderListItem(
          '/erxes-plugin-ebarimt/settings/return-stage',
          'Stage in Return Ebarimt config',
        )}
        {renderListItem(
          '/erxes-plugin-ebarimt/settings/product-rule',
          'Product rules on TAX',
        )}
      </List>
    </LeftSidebar>
  );
};

export default Sidebar;
