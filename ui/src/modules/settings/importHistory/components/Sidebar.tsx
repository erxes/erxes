import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';

const ITEM_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  PRODUCT: 'product',
  BRAND: 'brand',
  CHANNEL: 'channel',
  DEAL: 'deal',
  PERMISSION: 'permission',
  TASK: 'task',
  TICKET: 'ticket',
  TEAM_MEMBER: 'user',
  LEAD: 'lead'
};

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
            {this.renderListItem(ITEM_TYPES.BRAND, 'Brands')}
            {this.renderListItem(ITEM_TYPES.CHANNEL, 'Channels')}
            {this.renderListItem(ITEM_TYPES.LEAD, 'Leads')}
            {this.renderListItem(ITEM_TYPES.CUSTOMER, 'Customers')}
            {this.renderListItem(ITEM_TYPES.COMPANY, 'Companies')}
            {this.renderListItem(ITEM_TYPES.PERMISSION, 'Permissions')}
            {this.renderListItem(ITEM_TYPES.PRODUCT, 'Product & Service')}
            {this.renderListItem(ITEM_TYPES.DEAL, 'Deals')}
            {this.renderListItem(ITEM_TYPES.TASK, 'Tasks')}
            {this.renderListItem(ITEM_TYPES.TICKET, 'Tickets')}
            {this.renderListItem(ITEM_TYPES.TEAM_MEMBER, 'Team members')}
          </List>
        </LeftSidebar.Section>
      </LeftSidebar>
    );
  }
}

export default Sidebar;
