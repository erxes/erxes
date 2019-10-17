import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../constants';

type Props = {
  currentType: string;
  title: string;
};

class Sidebar extends React.Component<Props> {
  renderSidebarHeader = () => {
    const { title } = this.props;
    const { Header } = LeftSidebar;

    return <Header uppercase={true}>{__(title)}</Header>;
  };

  getClassName(type) {
    const { currentType } = this.props;

    if (type === currentType) {
      return 'active';
    }

    return '';
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
            <li>
              <Link
                className={this.getClassName('product')}
                to={`?type=${FIELDS_GROUPS_CONTENT_TYPES.PRODUCT}`}
              >
                {__('Product & Service')}
              </Link>
            </li>
          </List>
        </LeftSidebar.Section>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
