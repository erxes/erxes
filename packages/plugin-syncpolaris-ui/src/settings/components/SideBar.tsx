import {
  Sidebar as LeftSidebar,
  SidebarList as List,
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
      <LeftSidebar header={<SidebarHeader />} hasBorder={true}>
        <List id="SettingsSidebar">
          {this.renderListItem(
            '/erxes-plugin-sync-polaris/settings/general',
            'General config',
          )}
          {this.renderListItem(
            '/erxes-plugin-sync-polaris/settings/customer',
            'Customer config',
          )}
          {this.renderListItem(
            '/erxes-plugin-sync-polaris/settings/deposit',
            'Deposit config',
          )}
          {this.renderListItem(
            '/erxes-plugin-sync-polaris/settings/saving',
            'Saving config',
          )}
          {this.renderListItem(
            '/erxes-plugin-sync-polaris/settings/loan',
            'Loan config',
          )}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
