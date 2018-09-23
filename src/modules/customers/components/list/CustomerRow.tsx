import _ from 'lodash';
import { FormControl, NameCard, Tags } from 'modules/common/components';
import { FlexItem } from 'modules/companies/styles';
import { ICustomer } from 'modules/customers/types';
import * as moment from 'moment';
import * as React from 'react';

type Props = {
  customer: ICustomer;
  columnsConfig: any[];
  history: any;
  isChecked?: boolean;
  toggleBulk: (target: any, toAdd: boolean) => void;
};

function isTimeStamp(value) {
  if (typeof value === 'string') {
    value = parseInt(value, 10);
  }

  return (
    Number.isInteger(value) && value > 1000000000 && value <= 999999999999999
  );
}

function formatValue(value) {
  if (!value) {
    return '-';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (moment(value, moment.ISO_8601).isValid() || isTimeStamp(value)) {
    return moment(value).fromNow();
  }

  return value;
}

function displayValue(customer, name) {
  const value = _.get(customer, name);

  if (name === 'firstName') {
    return (
      <FlexItem>
        <NameCard.Avatar customer={customer} size={30} /> &emsp;
        {formatValue(customer.firstName)}
      </FlexItem>
    );
  }

  if (name === 'visitorContactInfo') {
    const visitorContactInfo = customer.visitorContactInfo;

    if (visitorContactInfo) {
      return formatValue(visitorContactInfo.email || visitorContactInfo.phone);
    }

    return '-';
  }

  return formatValue(value);
}

function CustomerRow({
  customer,
  columnsConfig,
  toggleBulk,
  isChecked,
  history
}: Props) {
  const tags = customer.getTags;

  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(customer, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  return (
    <tr
      onClick={() => {
        history.push(`/customers/details/${customer._id}`);
      }}
    >
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      {columnsConfig.map(({ name }, index) => (
        <td key={index}>{displayValue(customer, name)}</td>
      ))}
      <td>
        <Tags tags={tags} limit={2} />
      </td>
    </tr>
  );
}

export default CustomerRow;
