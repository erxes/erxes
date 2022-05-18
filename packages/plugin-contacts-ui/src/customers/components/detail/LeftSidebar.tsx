import BasicInfoSection from '../common/BasicInfoSection';
import CustomFieldsSection from '@erxes/ui-contacts/src/customers/containers/CustomFieldsSection';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import React from 'react';

import { ICustomer } from '../../types';
import { IField } from '@erxes/ui/src/types';
import {
  DevicePropertiesSection,
  TaggerSection,
  TrackedDataSection
} from '../common';
import WebsiteActivity from '@erxes/ui-contacts/src/customers/components/common/WebsiteActivity';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { IFieldsVisibility } from '@erxes/ui-contacts/src/customers/types';

type Props = {
  customer: ICustomer;
  deviceFields: IField[];
  taggerRefetchQueries?: any[];
  wide?: boolean;
  fieldsVisibility: IFieldsVisibility;
  deviceFieldsVisibility: IFieldsVisibility;
};

export default class LeftSidebar extends React.Component<Props> {
  render() {
    const {
      customer,
      fieldsVisibility,
      deviceFields,
      wide,
      taggerRefetchQueries,
      deviceFieldsVisibility
    } = this.props;
    return (
      <Sidebar wide={wide}>
        <BasicInfoSection
          customer={customer}
          fieldsVisibility={fieldsVisibility}
        />
        <CustomFieldsSection customer={customer} isDetail={true} />
        <DevicePropertiesSection
          customer={customer}
          fields={deviceFields}
          deviceFieldsVisibility={deviceFieldsVisibility}
        />
        <TrackedDataSection customer={customer} />
        <WebsiteActivity urlVisits={customer.urlVisits || []} />
        {isEnabled('tags') && (
          <TaggerSection
            data={customer}
            type="contacts:customer"
            refetchQueries={taggerRefetchQueries}
          />
        )}
      </Sidebar>
    );
  }
}
