import { __ } from '@erxes/ui/src/utils';
import {
  Sidebar as LeftSidebar,
  SidebarList as List
} from '@erxes/ui/src/layout';
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
          {this.renderListItem(
            '/settings/erxes-plugin-loyalty/general',
            'General config'
          )}
          {this.renderListItem(
            '/settings/erxes-plugin-loyalty/voucher',
            'Voucher'
          )}
          {this.renderListItem(
            '/settings/erxes-plugin-loyalty/lottery',
            'Lottery'
          )}
          {this.renderListItem('/settings/erxes-plugin-loyalty/spin', 'Spin')}
          {this.renderListItem(
            '/settings/erxes-plugin-loyalty/donate',
            'Donate'
          )}
          {this.renderListItem(
            '/settings/erxes-plugin-loyalty/assignment',
            'Assignment'
          )}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
