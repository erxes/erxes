import { __ } from '@erxes/ui/src/utils';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList as List } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { getPropertiesGroups } from '../constants';
import { SidebarList } from '@erxes/ui-settings/src/styles';

type Props = {
  currentType: string;
  services: string[];
};

class Sidebar extends React.Component<Props> {
  renderListItem(service) {
    const className =
      this.props.currentType && this.props.currentType === service.contentType
        ? 'active'
        : '';

    return (
      <li>
        <Link to={`?type=${service.contentType}`} className={className}>
          {__(service.description)}
        </Link>
      </li>
    );
  }

  render() {
    return (
      <LeftSidebar full={true}>
        <List>
          {this.props.services.map(service => this.renderListItem(service))}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
