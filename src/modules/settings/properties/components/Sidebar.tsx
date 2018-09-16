import { __ } from 'modules/common/utils';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { SidebarList as List } from 'modules/layout/styles';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../constants';

type Props = {
  currentType: string,
  title: string
};

class Sidebar extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.renderSidebarHeader = this.renderSidebarHeader.bind(this);
  }

  renderSidebarHeader() {
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

export default Sidebar;
