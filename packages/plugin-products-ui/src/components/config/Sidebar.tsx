import {
  Sidebar as LeftSidebar,
  SidebarList as List
} from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

class Sidebar extends React.Component {
  renderListItem(url: string, text: string) {
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
  }

  render() {
    return (
      <LeftSidebar header={<SidebarHeader />} hasBorder>
        <List id="SettingsSidebar">
          {this.renderListItem('/settings/uoms-manage', 'Uoms manage')}
        </List>
        <List id="SettingsSidebar">
          {this.renderListItem('/settings/products-config', 'General config')}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
