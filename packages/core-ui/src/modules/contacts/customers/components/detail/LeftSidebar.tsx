import {
  DevicePropertiesSection,
  TaggerSection,
  TrackedDataSection,
} from "../common";

import BasicInfoSection from "../common/BasicInfoSection";
import CustomFieldsSection from "@erxes/ui-contacts/src/customers/containers/CustomFieldsSection";
import { ICustomer } from "../../types";
import { IField } from "@erxes/ui/src/types";
import { IFieldsVisibility } from "@erxes/ui-contacts/src/customers/types";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import WebsiteActivity from "@erxes/ui-contacts/src/customers/components/common/WebsiteActivity";

type Props = {
  customer: ICustomer;
  deviceFields: IField[];
  fields: IField[];
  taggerRefetchQueries?: any[];
  wide?: boolean;
  fieldsVisibility: (key: string) => IFieldsVisibility;
  deviceFieldsVisibility: (key: string) => IFieldsVisibility;
};

export default class LeftSidebar extends React.Component<Props> {
  render() {
    const {
      customer,
      fieldsVisibility,
      deviceFields,
      fields,
      wide,
      taggerRefetchQueries,
      deviceFieldsVisibility,
    } = this.props;
    return (
      <Sidebar wide={wide}>
        <BasicInfoSection
          customer={customer}
          fieldsVisibility={fieldsVisibility}
          fields={fields}
        />

        <TaggerSection
          data={customer}
          type="core:customer"
          refetchQueries={taggerRefetchQueries}
        />

        <CustomFieldsSection customer={customer} isDetail={false} />
        <DevicePropertiesSection
          customer={customer}
          fields={deviceFields}
          deviceFieldsVisibility={deviceFieldsVisibility}
          isDetail={true}
        />
        <TrackedDataSection customer={customer} />
        <WebsiteActivity urlVisits={customer.urlVisits || []} />
      </Sidebar>
    );
  }
}
