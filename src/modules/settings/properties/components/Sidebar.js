import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { SidebarList as List } from 'modules/layout/styles';

const propTypes = {
  currentType: PropTypes.string
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

  getClassName(type) {
    const { currentType } = this.props;
    if (type === currentType) {
      return 'active';
    }
    return null;
  }

  render() {
    return (
      <LeftSidebar full header={this.renderSidebarHeader()}>
        <List>
          <li>
            <Link
              className={this.getClassName('Customer')}
              to={`?type=customer`}
            >
              Customer Properties
            </Link>
          </li>
          <li>
            <Link className={this.getClassName('Company')} to={`?type=company`}>
              Company Properties
            </Link>
          </li>
        </List>
      </LeftSidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
