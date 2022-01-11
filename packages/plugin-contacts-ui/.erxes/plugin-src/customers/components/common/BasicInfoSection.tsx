import { ICustomer } from '../../types';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { IField } from '@erxes/ui-settings/src/properties/types';
import React from 'react';

import DetailInfo from './DetailInfo';

type Props = {
  customer: ICustomer;
  fields: IField[];
};

class BasicInfo extends React.Component<Props> {
  render() {
    const { Section } = Sidebar;

    const { customer, fields } = this.props;

    return (
      <Section>
        <DetailInfo
          customer={customer}
          fields={fields}
          hasPosition={true}
          isDetail={true}
        />
      </Section>
    );
  }
}

export default BasicInfo;
