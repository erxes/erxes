import { ICustomer } from '../../types';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { IFieldsVisibility } from '@erxes/ui-contacts/src/customers/types';
import React from 'react';

import DetailInfo from '@erxes/ui-contacts/src/customers/components/common/DetailInfo';
import { IField } from '@erxes/ui/src/types';

type Props = {
  customer: ICustomer;
  fieldsVisibility: (key: string) => IFieldsVisibility;
  fields: IField[];
};

class BasicInfo extends React.Component<Props> {
  render() {
    const { Section } = Sidebar;

    const { customer, fieldsVisibility, fields } = this.props;

    return (
      <Section>
        <DetailInfo
          customer={customer}
          fieldsVisibility={fieldsVisibility}
          hasPosition={true}
          isDetail={true}
          fields={fields}
        />
      </Section>
    );
  }
}

export default BasicInfo;
