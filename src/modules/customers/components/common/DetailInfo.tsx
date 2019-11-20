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
import React from 'react';

type Props = {
  customer: ICustomer;
  hasPosition?: boolean;
};

class DetailInfo extends React.PureComponent<Props> {
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

  renderPosition(customer) {
    if (!this.props.hasPosition) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderRow('Position', customer.position)}
      </React.Fragment>
    );
  }

  render() {
    const { customer } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow('Code', customer.code)}
        {this.renderRow('Primary email', customer.primaryEmail)}
        {this.renderRow('Primary phone', customer.primaryPhone)}
        {this.renderPosition(customer)}
        {this.renderRow(
          'Owner',
          customer.owner && customer.owner.details
            ? customer.owner.details.fullName
            : ''
        )}
        {this.renderRow('Department', customer.department)}
        {this.renderRow(
          'Pop Ups Status',
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
