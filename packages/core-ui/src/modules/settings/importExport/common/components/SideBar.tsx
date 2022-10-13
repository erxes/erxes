import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  currentType?: string;
  services: any[];
};

class Sidebar extends React.Component<Props> {
  renderSidebarHeader = () => {
    const { Header } = LeftSidebar;

    return (
      <div>
        <Header uppercase={true}>{__('Filter by content type')}</Header>
      </div>
    );
  };

  renderListItem(service: any) {
    const { contentType, text } = service;
    const { currentType } = this.props;

    const className =
      currentType && currentType === contentType ? 'active' : '';

    return (
      <li key={Math.random()}>
        <Link to={`?type=${contentType}`} className={className}>
          {__(text)}
        </Link>
      </li>
    );
  }

  renderList() {
    const { services } = this.props;

    if (services && services.length !== 0)
      return (
        <List id={'ImportExportSidebar'}>
          {services.map(service => this.renderListItem(service))}
        </List>
      );

    return (
      <List id={'ImportExportSidebar'}>
        <li>
          <Link to="#">{__('No content type found!')}</Link>
        </li>
      </List>
    );
  }

  render() {
    return (
      <LeftSidebar header={this.renderSidebarHeader()} hasBorder>
        <LeftSidebar.Section>{this.renderList()}</LeftSidebar.Section>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
