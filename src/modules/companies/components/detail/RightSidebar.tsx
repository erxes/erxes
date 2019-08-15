import dayjs from 'dayjs';
import { __ } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import CustomerSection from 'modules/customers/components/common/CustomerSection';
import { ICustomer } from 'modules/customers/types';
import PortableDeals from 'modules/deals/components/PortableDeals';
import Sidebar from 'modules/layout/components/Sidebar';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';
import { List } from '../../styles';

type Props = {
  company: ICompany;
  createConformity: (relTypeId: string, relTypeIds: string[]) => void;
};

type State = {
  customers: ICustomer[];
};

export default class RightSidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const company = props.company;

    this.state = {
      customers: company.customers || []
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    switch (name) {
      case 'customers':
        const customerIds = (value as ICustomer[]).map(
          customer => customer._id
        );
        this.props.createConformity('customer', customerIds);
        break;
    }

    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  renderPlan(company) {
    if (!company.plan) {
      return null;
    }

    return (
      <li>
        <div>{__('Plan')}: </div>
        <span>{company.plan}</span>
      </li>
    );
  }

  render() {
    const { company } = this.props;
    const cmrsChange = cmrs => this.onChangeField('customers', cmrs);

    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Sidebar>
        <CustomerSection
          name={'Company'}
          customers={company.customers}
          itemId={company._id}
          itemKind={'customer'}
          onSelect={cmrsChange}
        />
        <PortableDeals
          companyIds={[company._id]}
          mainType="company"
          mainTypeId={company._id}
        />
        <PortableTickets
          companyIds={[company._id]}
          mainType="company"
          mainTypeId={company._id}
        />
        <PortableTasks
          companyIds={[company._id]}
          mainType="company"
          mainTypeId={company._id}
        />

        <Section>
          <Title>{__('Other')}</Title>
          <List>
            <li>
              <div>{__('Created at')}: </div>{' '}
              <span>{dayjs(company.createdAt).format('lll')}</span>
            </li>
            <li>
              <div>{__('Modified at')}: </div>{' '}
              <span>{dayjs(company.modifiedAt).format('lll')}</span>
            </li>
            {this.renderPlan(company)}
          </List>
        </Section>
      </Sidebar>
    );
  }
}
