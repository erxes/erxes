import dayjs from 'dayjs';
import _ from 'lodash';
import FormControl from 'modules/common/components/form/Control';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tags from 'modules/common/components/Tags';
import TextInfo from 'modules/common/components/TextInfo';
import { isTimeStamp, isValidDate } from 'modules/common/utils';
import { FlexItem } from 'modules/companies/styles';
import { Date } from 'modules/customers/styles';
import { ICustomer } from 'modules/customers/types';
import { IConfigColumn } from 'modules/settings/properties/types';
import React from 'react';

type Props = {
  customer: ICustomer;
  columnsConfig: IConfigColumn[];
  history: any;
  isChecked?: boolean;
  toggleBulk: (target: any, toAdd: boolean) => void;
};

function formatValue(value) {
  if (!value) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return (
      <TextInfo textStyle={value ? 'success' : 'warning'}>
        {value ? 'Yes' : 'No'}
      </TextInfo>
    );
  }

  if (typeof value === 'string') {
    return value;
  }

  if (isValidDate(value) || isTimeStamp(value)) {
    return <Date>{dayjs(value).format('lll')}</Date>;
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

  const onTrClick = () => {
    history.push(`/contacts/customers/details/${customer._id}`);
  };

  return (
    <tr onClick={onTrClick}>
      <td style={{ width: '50px' }} onClick={onClick}>
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
