import Box from '@erxes/ui/src/components/Box';
import CustomerSection from '../../../customers/components/common/CustomerSection';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';
import { List } from '../../styles';
import PortableDeals from '@erxes/ui-cards/src/deals/components/PortableDeals';
import PortableTasks from '@erxes/ui-cards/src/tasks/components/PortableTasks';
import PortableTickets from '@erxes/ui-cards/src/tickets/components/PortableTickets';
import PortablePurchases from '@erxes/ui-cards/src/purchases/components/PortablePurchases';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { pluginsOfCompanySidebar } from 'coreui/pluginUtils';
import ActionSection from '@erxes/ui-contacts/src/customers/containers/ActionSection';

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
        <CustomerSection
          mainType="company"
          mainTypeId={company._id}
          actionSection={ActionSection}
        />
        {isEnabled('cards') && (
          <>
            <PortableDeals mainType="company" mainTypeId={company._id} />
            <PortableTickets mainType="company" mainTypeId={company._id} />
            <PortableTasks mainType="company" mainTypeId={company._id} />
            <PortablePurchases mainType="company" mainTypeId={company._id} />
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
