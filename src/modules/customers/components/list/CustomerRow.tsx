import _ from 'lodash';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tags from 'modules/common/components/Tags';
import { colors } from 'modules/common/styles';
import { formatValue } from 'modules/common/utils';
import { FlexItem } from 'modules/companies/styles';
import { ClickableRow } from 'modules/customers/styles';
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

  if (typeof value === 'boolean') {
    return (
      <div style={{ textAlign: 'center' }}>
        <Icon
          icon={value ? 'check-1' : 'times'}
          size={16}
          style={{ color: colors.colorCoreGreen }}
        />
      </div>
    );
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
    <tr>
      <td style={{ width: '50px' }} onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      {columnsConfig.map(({ name }, index) => (
        <td key={index}>
          <ClickableRow onClick={onTrClick}>
            {displayValue(customer, name)}
          </ClickableRow>
        </td>
      ))}
      <td onClick={onTrClick}>
        <Tags tags={tags} limit={2} />
      </td>
    </tr>
  );
}

export default CustomerRow;
