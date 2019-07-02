import { Action } from 'modules/customers/styles';
import { ICustomer } from 'modules/customers/types';
import { Sidebar } from 'modules/layout/components';
import React from 'react';
import { ActionSection } from '../../containers/common';
import { DetailInfo, InfoSection } from './';

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
        <Action>
          <ActionSection customer={customer} />
        </Action>
        <DetailInfo customer={customer} hasPosition={true} />
      </Section>
    );
  }
}

export default BasicInfo;
