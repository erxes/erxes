import Box from 'modules/common/components/Box';
import EmptyState from 'modules/common/components/EmptyState';
import { __ } from 'modules/common/utils';
import CompanySection from 'modules/companies/components/common/CompanySection';
import { List } from 'modules/companies/styles';
import { ICustomer } from 'modules/customers/types';
import PortableDeals from 'modules/deals/components/PortableDeals';
import Sidebar from 'modules/layout/components/Sidebar';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';

type Props = {
  customer: ICustomer;
};

export default class RightSidebar extends React.Component<Props> {
  renderContent() {
    const { customer } = this.props;
    const { integration, visitorContactInfo } = customer;

    if (!integration && !visitorContactInfo) {
      return <EmptyState icon="clipboard" text="Empty" size="small" />;
    }

    return (
      <List>
        {integration && integration.name && (
          <li>
            <div>{__('Integration')}:</div>
            <span>{integration.name}</span>
          </li>
        )}
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
        {this.renderOther()}
      </Sidebar>
    );
  }
}
