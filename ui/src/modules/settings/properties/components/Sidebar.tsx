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

  renderListItem(type: string, text: string) {
    return (
      <li>
        <Link to={`?type=${type}`} className={this.getClassName(type)}>
          {__(text)}
        </Link>
      </li>
    );
  }

  render() {
    return (
      <LeftSidebar header={this.renderSidebarHeader()}>
        <LeftSidebar.Section>
          <List>
            {this.renderListItem(FIELDS_GROUPS_CONTENT_TYPES.BRAND, 'Brands')}
            {this.renderListItem(
              FIELDS_GROUPS_CONTENT_TYPES.CHANNEL,
              'Channels'
            )}
            {this.renderListItem(
              FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
              'Customers'
            )}
            {this.renderListItem(
              FIELDS_GROUPS_CONTENT_TYPES.COMPANY,
              'Companies'
            )}
            {this.renderListItem(
              FIELDS_GROUPS_CONTENT_TYPES.PERMISSION,
              'Permissions'
            )}
            {this.renderListItem(
              FIELDS_GROUPS_CONTENT_TYPES.PRODUCT,
              'Product & Service'
            )}
            {this.renderListItem(FIELDS_GROUPS_CONTENT_TYPES.DEAL, 'Deals')}
            {this.renderListItem(FIELDS_GROUPS_CONTENT_TYPES.TASK, 'Tasks')}
            {this.renderListItem(FIELDS_GROUPS_CONTENT_TYPES.TICKET, 'Tickets')}
            {this.renderListItem(
              FIELDS_GROUPS_CONTENT_TYPES.TEAM_MEMBER,
              'Team members'
            )}
          </List>
        </LeftSidebar.Section>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
