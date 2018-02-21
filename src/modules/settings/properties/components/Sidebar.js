import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { SidebarList as List } from 'modules/layout/styles';
import { SidebarListItem } from 'modules/settings/styles';

const propTypes = {
  contentType: PropTypes.string
};

class Sidebar extends Component {
  renderSidebarHeader() {
    const { Header } = LeftSidebar;

    return (
      <Header uppercase bold>
        Type
      </Header>
    );
  }

  render() {
    return (
      <LeftSidebar full header={this.renderSidebarHeader()}>
        <List>
          <SidebarListItem>
            <Link to={`?type=Customer`}>Customers</Link>
          </SidebarListItem>
          <SidebarListItem>
            <Link to={`?type=Company`}>Companies</Link>
          </SidebarListItem>
        </List>
      </LeftSidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
