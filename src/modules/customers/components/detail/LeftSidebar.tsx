import { BasicInfoSection } from 'modules/customers/components/common';
import { CustomFieldsSection } from 'modules/customers/containers/common';
import { Sidebar } from 'modules/layout/components';
import React from 'react';

import { ICustomer } from 'modules/customers/types';
import {
  DevicePropertiesSection,
  MessengerSection,
  TaggerSection
} from '../common';

type Props = {
  customer: ICustomer;
  taggerRefetchQueries?: any[];
  wide?: boolean;
};

export default class LeftSidebar extends React.Component<Props> {
  render() {
    const { customer, wide, taggerRefetchQueries } = this.props;

    return (
      <Sidebar wide={wide}>
        <BasicInfoSection customer={customer} />
        <CustomFieldsSection customer={customer} />
        <DevicePropertiesSection customer={customer} />
        <MessengerSection customer={customer} />
        <TaggerSection
          data={customer}
          type="customer"
          refetchQueries={taggerRefetchQueries}
        />
      </Sidebar>
    );
  }
}
