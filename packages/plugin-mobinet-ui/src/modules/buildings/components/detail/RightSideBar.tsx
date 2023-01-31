import { Sidebar } from '@erxes/ui/src';
import React from 'react';
import { IBuilding } from '../../types';
import CompanySection from './sections/CompanySection';
import PortableItems from '@erxes/ui-cards/src/boards/components/portable/Items';
import options from '@erxes/ui-cards/src/tickets/options';

import CustomerSection from './sections/CustomerSection';

type Props = {
  building: IBuilding;
  onSelectContacts: (datas: any, type: string) => void;
};

export default class RightSidebar extends React.Component<Props> {
  onSelectCustomers = (datas: any) => {
    this.props.onSelectContacts(datas, 'customer');
  };

  onSelectCompanies = (datas: any) => {
    this.props.onSelectContacts(datas, 'company');
  };

  render() {
    const { building } = this.props;
    const ticketIds = building.ticketIds || [];

    let title = 'Active tickets';

    if (ticketIds.length > 0) {
      title += ` (${ticketIds.length})`;
    }

    return (
      <Sidebar wide={true}>
        <CustomerSection
          building={building}
          onSelectCustomers={this.onSelectCustomers}
        />
        <CompanySection
          building={building}
          onSelectCompanies={this.onSelectCompanies}
        />

        <PortableItems
          data={{
            options: { ...options, title },
            hideExtraButton: true
          }}
          items={building.tickets}
          onChangeItem={() => {
            console.log('onChangeItem');
          }}
        />
      </Sidebar>
    );
  }
}
