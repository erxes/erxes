import { __ } from '@erxes/ui/src/utils';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList as List } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { HeaderItems } from '@erxes/ui/src/layout/styles';
import Icon from '@erxes/ui/src/components/Icon';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

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
      <li key={service.contentType}>
        <Link to={`?type=${service.contentType}`} className={className}>
          {__(service.description)}
          <HeaderItems rightAligned={true}>
            {this.props.currentType === service.contentType ? (
              <Icon icon="angle-right" />
            ) : null}
          </HeaderItems>
        </Link>
      </li>
    );
  }

  render() {
    return (
      <LeftSidebar header={<SidebarHeader />} hasBorder>
        <List>
          {this.props.services.map(service => this.renderListItem(service))}
        </List>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
