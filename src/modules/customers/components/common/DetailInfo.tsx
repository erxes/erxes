import { __ } from 'modules/common/utils';
import {
  LEAD_STATUS_TYPES,
  LIFECYCLE_STATE_TYPES
} from 'modules/customers/constants';
import { ICustomer } from 'modules/customers/types';
import {
  SidebarCounter,
  SidebarFlexRow,
  SidebarList
} from 'modules/layout/styles';
import * as React from 'react';

type Props = {
  customer: ICustomer;
  hasEmailAndPhone?: boolean;
};

class DetailInfo extends React.Component<Props> {
  renderRow(label, value) {
    return (
      <li>
        {__(`${label}`)}:
        <SidebarCounter fullLength={label === 'Description'}>
          {value || '-'}
        </SidebarCounter>
      </li>
    );
  }

  renderPhoneAndEmail(customer) {
    if (!this.props.hasEmailAndPhone) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderRow('Primary email', customer.primaryEmail)}
        {this.renderRow('Primary phone', customer.primaryPhone)}
        {this.renderRow('Position', customer.position)}
      </React.Fragment>
    );
  }

  render() {
    const { customer } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderPhoneAndEmail(customer)}
        {this.renderRow(
          'Owner',
          customer.owner && customer.owner.details
            ? customer.owner.details.fullName
            : ''
        )}
        {this.renderRow('Department', customer.department)}
        {this.renderRow(
          'Lead Status',
          LEAD_STATUS_TYPES[customer.leadStatus || '']
        )}
        {this.renderRow(
          'Lifecycle State',
          LIFECYCLE_STATE_TYPES[customer.lifecycleState || '']
        )}
        {this.renderRow('Has Authority', customer.hasAuthority)}
        {this.renderRow('Do not disturb', customer.doNotDisturb)}
        <SidebarFlexRow>
          {__(`Description`)}:<span>{customer.description || '-'}</span>
        </SidebarFlexRow>
      </SidebarList>
    );
  }
}

export default DetailInfo;
