import { ICustomer } from 'modules/customers/types';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';

import DetailInfo from './DetailInfo';

type Props = {
  customer: ICustomer;
};

class BasicInfo extends React.Component<Props> {
  render() {
    const { Section } = Sidebar;

    const { customer } = this.props;

    return (
      <Section>
        <DetailInfo customer={customer} hasPosition={true} />
      </Section>
    );
  }
}

export default BasicInfo;
