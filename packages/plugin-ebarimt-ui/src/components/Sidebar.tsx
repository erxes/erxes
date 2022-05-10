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
      <LeftSidebar noMargin header={<SidebarHeader />} hasBorder={true}>
        <List id="SettingsSidebar">
          {this.renderListItem(
            '/erxes-plugin-ebarimt/settings/general',
            'General config'
          )}
          {this.renderListItem(
            '/erxes-plugin-ebarimt/settings/stage',
            'Stage in Ebarimt config'
          )}
          {this.renderListItem(
            '/erxes-plugin-ebarimt/settings/return-stage',
            'Stage in Return Ebarimt config'
          )}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
