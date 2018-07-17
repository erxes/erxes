import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { SidebarList as List } from 'modules/layout/styles';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../constants';

const propTypes = {
  currentType: PropTypes.string,
  title: PropTypes.string.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.renderSidebarHeader = this.renderSidebarHeader.bind(this);
  }
  renderSidebarHeader() {
    const { __ } = this.context;
    const { title } = this.props;
    const { Header } = LeftSidebar;

    return <Header uppercase>{__(title)}</Header>;
  }

  getClassName(type) {
    const { currentType } = this.props;

    if (type === currentType) {
      return 'active';
    }
    return null;
  }

  render() {
    const { __ } = this.context;
    return (
      <LeftSidebar header={this.renderSidebarHeader()}>
        <LeftSidebar.Section>
          <List>
            <li>
              <Link
                className={this.getClassName('customer')}
                to={`?type=${FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER}`}
              >
                {__('Customer')}
              </Link>
            </li>
            <li>
              <Link
                className={this.getClassName('company')}
                to={`?type=${FIELDS_GROUPS_CONTENT_TYPES.COMPANY}`}
              >
                {__('Company')}
              </Link>
            </li>
          </List>
        </LeftSidebar.Section>
      </LeftSidebar>
    );
  }
}

Sidebar.propTypes = propTypes;
Sidebar.contextTypes = contextTypes;

export default Sidebar;
