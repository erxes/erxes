import BasicInfoSection from '../common/BasicInfoSection';
import CustomFieldsSection from '../../containers/common/CustomFieldsSection';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import React from 'react';

import { ICustomer } from '../../types';
import { IField } from '@erxes/ui-settings/src/properties/types';
import {
  DevicePropertiesSection,
  TaggerSection,
  TrackedDataSection
} from '../common';
import WebsiteActivity from '../common/WebsiteActivity';

type Props = {
  customer: ICustomer;
  fields: IField[];
  deviceFields: IField[];
  taggerRefetchQueries?: any[];
  wide?: boolean;
};

export default class LeftSidebar extends React.Component<Props> {
  render() {
    const {
      customer,
      fields,
      deviceFields,
      wide,
      taggerRefetchQueries
    } = this.props;
    return (
      <Sidebar wide={wide}>
        <BasicInfoSection customer={customer} fields={fields} />
        <CustomFieldsSection customer={customer} isDetail={true} />
        <DevicePropertiesSection
          customer={customer}
          fields={deviceFields}
          isDetail={true}
        />
        <TrackedDataSection customer={customer} />
        <WebsiteActivity urlVisits={customer.urlVisits || []} />
        <TaggerSection
          data={customer}
          type="customer"
          refetchQueries={taggerRefetchQueries}
        />
      </Sidebar>
    );
  }
}
