import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { GENDER_TYPES } from 'modules/customers/constants';
import { Status } from 'modules/customers/styles';
import { ICustomer } from 'modules/customers/types';
import {
  FieldStyle,
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
        <FieldStyle>{__(`${label}`)}:</FieldStyle>
        <SidebarCounter fullLength={label === 'Description'}>
          {value || '-'}
        </SidebarCounter>
      </li>
    );
  }

  renderEmail(status?: string, email?: string) {
    const renderStatus = () => {
      if (status) {
        return (
          <Tip text={`Status: ${status}`} placement="top">
            <Status verified={status === 'valid'}>
              <Icon
                icon={status === 'valid' ? 'shield-check' : 'shield-slash'}
              />
            </Status>
          </Tip>
        );
      }
      return null;
    };

    return (
      <li>
        <FieldStyle>{__('Primary email')}:</FieldStyle>
        <SidebarCounter>
          {email ? (
            <a href={`mailto:${email}`}>
              {email}
              {renderStatus()}
            </a>
          ) : (
            '-'
          )}
        </SidebarCounter>
      </li>
    );
  }

  renderPosition(customer) {
    if (!this.props.hasPosition) {
      return null;
    }

    return this.renderRow('Position', customer.position);
  }

  render() {
    const { customer } = this.props;

    return (
      <SidebarList className="no-link">
        {this.renderRow('Code', customer.code)}
        {this.renderEmail(
          customer.emailValidationStatus,
          customer.primaryEmail
        )}
        {this.renderRow('Primary phone', customer.primaryPhone)}
        {this.renderPosition(customer)}
        {this.renderRow(
          'Owner',
          customer.owner && customer.owner.details
            ? customer.owner.details.fullName
            : ''
        )}
        {this.renderRow('Department', customer.department)}
        {this.renderRow('Gender', GENDER_TYPES[customer.sex || 0])}
        {this.renderRow(
          'Birthday',
          customer.birthDate && dayjs(customer.birthDate).format('MMM,DD YYYY')
        )}
        {this.renderRow('Do not disturb', customer.doNotDisturb)}
        <SidebarFlexRow>
          {__(`Description`)}:<span>{customer.description || '-'}</span>
        </SidebarFlexRow>
      </SidebarList>
    );
  }
}

export default DetailInfo;
