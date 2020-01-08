import { ICustomer } from 'modules/customers/types';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import ActionSection from '../../containers/common/ActionSection';
import DetailInfo from './DetailInfo';
import InfoSection from './InfoSection';

type Props = {
  customer: ICustomer;
};

class BasicInfo extends React.Component<Props> {
  render() {
    const { Section } = Sidebar;

    const { customer } = this.props;

    return (
      <Section>
        <InfoSection customer={customer} />
        <ActionSection customer={customer} />
        <DetailInfo customer={customer} hasPosition={true} />
      </Section>
    );
  }
}

export default BasicInfo;
