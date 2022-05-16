import dayjs from 'dayjs';
import Box from '@erxes/ui/src/components/Box';
import { __ } from 'coreui/utils';
import { ICompany } from '@erxes/ui/src/companies/types';
import CustomerSection from '../../../customers/components/common/CustomerSection';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import PortableDeals from '@erxes/ui-cards/src/deals/components/PortableDeals';
import PortableTasks from '@erxes/ui-cards/src/tasks/components/PortableTasks';
import PortableTickets from '@erxes/ui-cards/src/tickets/components/PortableTickets';

import React from 'react';
import { List } from '../../styles';
import { isEnabled } from '@erxes/ui/src/utils/core';

import { pluginsOfCompanySidebar } from 'coreui/pluginUtils';

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
        {isEnabled('cards') && (
          <>
            <PortableDeals mainType="company" mainTypeId={company._id} />
            <PortableTickets mainType="company" mainTypeId={company._id} />
            <PortableTasks mainType="company" mainTypeId={company._id} />
          </>
        )}
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
