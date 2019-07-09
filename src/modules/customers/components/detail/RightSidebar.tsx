import EmptyState from 'modules/common/components/EmptyState';
import { __ } from 'modules/common/utils';
import CompanyAssociate from 'modules/companies/containers/CompanyAssociate';
import { List } from 'modules/companies/styles';
import { ICustomer } from 'modules/customers/types';
import PortableDeals from 'modules/deals/components/PortableDeals';
import Sidebar from 'modules/layout/components/Sidebar';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';

export default class RightSidebar extends React.Component<{
  customer: ICustomer;
}> {
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
    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Section>
        <Title>{__('Other')}</Title>
        {this.renderContent()}
      </Section>
    );
  }

  render() {
    const { customer } = this.props;

    return (
      <Sidebar>
        <CompanyAssociate data={customer} />
        <PortableDeals customerIds={[customer._id]} />
        <PortableTickets customerIds={[customer._id]} />
        <PortableTasks customerIds={[customer._id]} />
        {this.renderOther()}
      </Sidebar>
    );
  }
}
