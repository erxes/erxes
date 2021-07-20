import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from 'modules/settings/common/components/SidebarHeader';

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
      <LeftSidebar full={true} header={<SidebarHeader />}>
        <List id="SettingsSidebar">
          {this.renderListItem('/settings/general', 'General system config')}
          {this.renderListItem(
            '/settings/integration-configs',
            'Integrations config'
          )}
          {this.renderListItem('/settings/campaign-configs', 'Campaign config')}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
