import { Sidebar } from '@erxes/ui/src';
import React from 'react';
import { IBuilding } from '../../types';
import CompanySection from './sections/CompanySection';

// import DealsSection from './sections/DealsSection';

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
    return (
      <Sidebar wide={true}>
        <CustomerSection
          building={this.props.building}
          onSelectCustomers={this.onSelectCustomers}
        />
        <CompanySection
          building={this.props.building}
          onSelectCompanies={this.onSelectCompanies}
        />
      </Sidebar>
    );
  }
}
