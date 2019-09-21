import dayjs from 'dayjs';
import { __ } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import CustomerAssociate from 'modules/customers/containers/CustomerAssociate';
import PortableDeals from 'modules/deals/components/PortableDeals';
import Sidebar from 'modules/layout/components/Sidebar';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';
import { List } from '../../styles';

export default class RightSidebar extends React.Component<{
  company: ICompany;
}> {
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

    const { Section } = Sidebar;
    const { Title } = Section;

    return (
      <Sidebar>
        <CustomerAssociate data={company} />
        <PortableDeals companyIds={[company._id]} />
        <PortableTickets companyIds={[company._id]} />
        <PortableTasks companyIds={[company._id]} />

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
