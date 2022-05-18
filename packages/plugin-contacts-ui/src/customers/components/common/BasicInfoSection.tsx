import { ICustomer } from '../../types';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { IFieldsVisibility } from '@erxes/ui-contacts/src/customers/types';
import React from 'react';

import DetailInfo from '@erxes/ui-contacts/src/customers/components/common/DetailInfo';

type Props = {
  customer: ICustomer;
  fieldsVisibility: IFieldsVisibility;
};

class BasicInfo extends React.Component<Props> {
  render() {
    const { Section } = Sidebar;

    const { customer, fieldsVisibility } = this.props;

    return (
      <Section>
        <DetailInfo
          customer={customer}
          fieldsVisibility={fieldsVisibility}
          hasPosition={true}
        />
      </Section>
    );
  }
}

export default BasicInfo;
