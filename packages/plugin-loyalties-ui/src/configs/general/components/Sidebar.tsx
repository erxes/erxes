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
            '/erxes-plugin-loyalty/settings/general',
            'General config'
          )}
          {this.renderListItem(
            '/erxes-plugin-loyalty/settings/voucher',
            'Voucher'
          )}
          {this.renderListItem(
            '/erxes-plugin-loyalty/settings/lottery',
            'Lottery'
          )}
          {this.renderListItem('/erxes-plugin-loyalty/settings/spin', 'Spin')}
          {this.renderListItem(
            '/erxes-plugin-loyalty/settings/donate',
            'Donate'
          )}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
