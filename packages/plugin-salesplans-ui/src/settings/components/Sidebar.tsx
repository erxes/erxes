import {
  Sidebar as LeftSidebar,
  SidebarList as List
} from '@erxes/ui/src/layout';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';
import { Link } from 'react-router-dom';

interface Props {
  children: any;
  history: any;
  queryParams: any;
}

const { Section } = Wrapper.Sidebar;

class Sidebar extends React.Component<Props> {
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
    const { children } = this.props;
    const Children = children;
    return (
      <Wrapper.Sidebar hasBorder>
        <List id="SettingsSidebar">
          {this.renderListItem('/salesplans/labels', 'Manage Day tag')}
          {this.renderListItem('/salesplans/timeframes', 'Manage Day interval')}
        </List>
        <Children {...this.props} />
      </Wrapper.Sidebar>
    );
  }
}

export default Sidebar;
