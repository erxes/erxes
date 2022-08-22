import { __ } from '@erxes/ui/src/utils';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList as List } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '../../common/components/SidebarHeader';

class Sidebar extends React.Component<{ isThemeEnabled?: boolean; item: any }> {
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
    const { item } = this.props;

    return (
      <LeftSidebar header={<SidebarHeader />} full={true} hasBorder>
        <List id="SettingsSidebar">
          {this.renderListItem(item.url, item.text)}

          {this.props.isThemeEnabled
            ? this.renderListItem('/settings/theme', 'Theme config')
            : null}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
