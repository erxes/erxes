import { PortableItems } from 'modules/boards/containers';
import { EmptyState } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { CompanyAssociate } from 'modules/companies/containers';
import { List } from 'modules/companies/styles';
import { ICustomer } from 'modules/customers/types';
import dealOptions from 'modules/deals/options';
import { Sidebar } from 'modules/layout/components';
import ticketOptions from 'modules/tickets/options';
import * as React from 'react';

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
        <PortableItems options={dealOptions} customerIds={[customer._id]} />
        <PortableItems options={ticketOptions} customerIds={[customer._id]} />
        {this.renderOther()}
      </Sidebar>
    );
  }
}
