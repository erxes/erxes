import { isEnabled, renderFullName } from '@erxes/ui/src/utils/core';

import Box from '@erxes/ui/src/components/Box';
import CompanySection from '@erxes/ui-contacts/src/companies/components/CompanySection';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { ICustomer } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { List } from '../../../companies/styles';
import PortableDeals from '@erxes/ui-cards/src/deals/components/PortableDeals';
import PortableTasks from '@erxes/ui-cards/src/tasks/components/PortableTasks';
import PortableTickets from '@erxes/ui-cards/src/tickets/components/PortableTickets';
import PortabelPurchases from '@erxes/ui-cards/src/purchases/components/PortablePurchases';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';
import colors from '@erxes/ui/src/styles/colors';
import { pluginsOfCustomerSidebar } from 'coreui/pluginUtils';

type Props = {
  customer: ICustomer;
};

export default class RightSidebar extends React.Component<Props> {
  renderContent() {
    const { customer } = this.props;
    const { integration, visitorContactInfo } = customer;

    if (!integration && !visitorContactInfo) {
      return <EmptyState icon="folder-2" text="Empty" size="small" />;
    }

    let integrationNode: React.ReactNode = null;
    let icon: string = 'check-1';
    let color: string = colors.colorCoreGreen;
    let text: string = __('Active');

    if (integration && integration.name) {
      if (!integration.isActive) {
        icon = 'archive-alt';
        color = colors.colorPrimary;
        text = __('Inactive');
      }

      integrationNode = (
        <li>
          <div>{__('Integration')}:</div>
          {integration.name}
          <Tip text={text}>
            <Icon icon={icon} color={color} />
          </Tip>
        </li>
      );
    }

    return (
      <List>
        {integrationNode}
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

    const mainTypeName = renderFullName(customer);

    return (
      <Sidebar>
        <CompanySection mainType="customer" mainTypeId={customer._id} />
        {isEnabled('cards') && (
          <>
            <PortableDeals
              mainType="customer"
              mainTypeId={customer._id}
              mainTypeName={mainTypeName}
            />
            <PortableTickets
              mainType="customer"
              mainTypeId={customer._id}
              mainTypeName={mainTypeName}
            />
            <PortableTasks
              mainType="customer"
              mainTypeId={customer._id}
              mainTypeName={mainTypeName}
            />
            <PortabelPurchases
              mainType="customer"
              mainTypeId={customer._id}
              mainTypeName={mainTypeName}
            />
          </>
        )}

        {pluginsOfCustomerSidebar(customer)}

        {this.renderOther()}
      </Sidebar>
    );
  }
}
