import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

type Props = {
  currentType?: string;
  services: any[];
};

class Sidebar extends React.Component<Props> {
  renderSidebarHeader = () => {
    const { Header } = LeftSidebar;

    return (
      <>
        <SidebarHeader />
        <Header isSettings uppercase={true}>
          {__('Filter by content type')}
        </Header>
      </>
    );
  };

  renderListItem(service) {
    const className =
      this.props.currentType && this.props.currentType === service.contentType
        ? 'active'
        : '';

    return (
      <li>
        <Link to={`?type=${service.contentType}`} className={className}>
          {__(service.text)}
        </Link>
      </li>
    );
  }

  render() {
    return (
      <LeftSidebar
        noMargin={true}
        header={this.renderSidebarHeader()}
        hasBorder={true}
      >
        <LeftSidebar.Section noMargin noShadow>
          {this.props.services.length === 0 ? null : (
            <List id={'ImportExportSidebar'}>
              {this.props.services.map(service => this.renderListItem(service))}
            </List>
          )}
        </LeftSidebar.Section>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
