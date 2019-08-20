import dayjs from 'dayjs';
import { __ } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { onSelectChange } from 'modules/conformity/utils';
import CustomerSection from 'modules/customers/components/common/CustomerSection';
import { ICustomer } from 'modules/customers/types';
import PortableDeals from 'modules/deals/components/PortableDeals';
import { IDeal } from 'modules/deals/types';
import Sidebar from 'modules/layout/components/Sidebar';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import { ITask } from 'modules/tasks/types';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import { ITicket } from 'modules/tickets/types';
import React from 'react';
import { List } from '../../styles';

type Props = {
  company: ICompany;
  createConformity: (relTypeId: string, relTypeIds: string[]) => void;
};

type State = {
  customers: ICustomer[];
  deals: IDeal[];
  tickets: ITicket[];
  tasks: ITask[];
};

export default class RightSidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const company = props.company;

    this.state = {
      customers: company.customers || [],
      deals: company.deals || [],
      tasks: company.tasks || [],
      tickets: company.tickets || []
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    onSelectChange(name, value, this.props.createConformity);

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
    const dealsChange = deals => this.onChangeField('deals', deals);
    const ticketsChange = tickets => this.onChangeField('tickets', tickets);
    const tasksChange = tasks => this.onChangeField('tasks', tasks);

    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Sidebar>
        <CustomerSection
          name={'Company'}
          customers={company.customers}
          mainType={'company'}
          mainTypeId={company._id}
          onSelect={cmrsChange}
        />
        <PortableDeals
          mainType="company"
          mainTypeId={company._id}
          onSelect={dealsChange}
        />
        <PortableTickets
          mainType="company"
          mainTypeId={company._id}
          onSelect={ticketsChange}
        />
        <PortableTasks
          mainType="company"
          mainTypeId={company._id}
          onSelect={tasksChange}
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
