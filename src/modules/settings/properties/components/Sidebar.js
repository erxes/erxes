import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { SidebarList as List } from 'modules/layout/styles';

const propTypes = {
  contentType: PropTypes.string
};

class Sidebar extends Component {
  renderSidebarHeader() {
    const { Header } = LeftSidebar;

    return (
      <Header uppercase bold>
        Properties
      </Header>
    );
  }

  render() {
    return (
      <LeftSidebar full header={this.renderSidebarHeader()}>
        <List>
          <li>
            <NavLink activeClassName="active" to={`?type=Customer`}>
              Customer Properties
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to={`?type=Company`}>
              Company Properties
            </NavLink>
          </li>
        </List>
      </LeftSidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
