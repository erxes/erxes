import EmptyState from 'modules/common/components/EmptyState';
import { __ } from 'modules/common/utils';
import CompanySection from 'modules/companies/components/common/CompanySection';
import { List } from 'modules/companies/styles';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import PortableDeals from 'modules/deals/components/PortableDeals';
import Sidebar from 'modules/layout/components/Sidebar';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';

type Props = {
  customer: ICustomer;
  createConformity: (relTypeId: string, relTypeIds: string[]) => void;
};

type State = {
  companies: ICompany[];
};

export default class RightSidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const customer = props.customer;

    this.state = {
      companies: customer.companies || []
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    switch (name) {
      case 'companies':
        const companyIds = (value as ICompany[]).map(company => company._id);
        this.props.createConformity('company', companyIds);
        break;
    }

    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

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
    const cmpsChange = cmps => this.onChangeField('companies', cmps);

    return (
      <Sidebar>
        <CompanySection
          name={'Customer'}
          companies={customer.companies}
          mainType={'company'}
          mainTypeId={customer._id}
          onSelect={cmpsChange}
        />
        <PortableDeals mainType="customer" mainTypeIds={[customer._id]} />
        <PortableTickets mainType="customer" mainTypeIds={[customer._id]} />
        <PortableTasks mainType="customer" mainTypeIds={[customer._id]} />
        {this.renderOther()}
      </Sidebar>
    );
  }
}
