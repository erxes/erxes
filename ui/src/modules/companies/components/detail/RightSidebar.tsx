import dayjs from 'dayjs';
import Box from 'modules/common/components/Box';
import { __ } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import CustomerSection from 'modules/customers/components/common/CustomerSection';
import PortableDeals from 'modules/deals/components/PortableDeals';
import Sidebar from 'modules/layout/components/Sidebar';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import { pluginsOfCompanySidebar } from 'pluginUtils';
import React from 'react';
import { List } from '../../styles';

type Props = {
  company: ICompany;
};

export default class RightSidebar extends React.Component<Props> {
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

    return (
      <Sidebar>
        <CustomerSection mainType="company" mainTypeId={company._id} />
        <PortableDeals mainType="company" mainTypeId={company._id} />
        <PortableTickets mainType="company" mainTypeId={company._id} />
        <PortableTasks mainType="company" mainTypeId={company._id} />
        {pluginsOfCompanySidebar(company)}
        <Box title={__('Other')} name="showOthers">
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
        </Box>
      </Sidebar>
    );
  }
}
