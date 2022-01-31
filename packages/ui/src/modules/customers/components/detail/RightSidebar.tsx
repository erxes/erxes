import Box from 'modules/common/components/Box';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import CompanySection from 'modules/companies/components/common/CompanySection';
import { List } from 'modules/companies/styles';
import { ICustomer } from 'modules/customers/types';
import PortableDeals from 'modules/deals/components/PortableDeals';
import Sidebar from 'modules/layout/components/Sidebar';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import { pluginsOfCustomerSidebar } from 'pluginUtils';
import React from 'react';

type Props = {
  customer: ICustomer;
};

export default class RightSidebar extends React.Component<Props> {
  renderContent() {
    const { customer } = this.props;
    const { integration, visitorContactInfo } = customer;

    if (!integration && !visitorContactInfo) {
      return <EmptyState icon="folder-2" text="Empty" size="small" />;
    }

    let integrationNode: React.ReactNode = null;
    let icon: string = 'check-1';
    let color: string = colors.colorCoreGreen;
    let text: string = __('Active');

    if (integration && integration.name) {
      if (!integration.isActive) {
        icon = 'archive-alt';
        color = colors.colorPrimary;
        text = __('Inactive');
      }

      integrationNode = (
        <li>
          <div>{__('Integration')}:</div>
          {integration.name}
          <Tip text={text}>
            <Icon icon={icon} color={color} />
          </Tip>
        </li>
      );
    }

    return (
      <List>
        {integrationNode}
        {visitorContactInfo && (
          <li>
            <div>{__('Visitor contact info')}:</div>
            <span>{visitorContactInfo.email || visitorContactInfo.phone}</span>
          </li>
        )}
      </List>
    );
  }

  renderOther() {
    return (
      <Box title={__('Other')} name="showOthers">
        {this.renderContent()}
      </Box>
    );
  }

  render() {
    const { customer } = this.props;

    return (
      <Sidebar>
        <CompanySection mainType="customer" mainTypeId={customer._id} />
        <PortableDeals mainType="customer" mainTypeId={customer._id} />
        <PortableTickets mainType="customer" mainTypeId={customer._id} />
        <PortableTasks mainType="customer" mainTypeId={customer._id} />
        {pluginsOfCustomerSidebar(customer)}
        {this.renderOther()}
      </Sidebar>
    );
  }
}
