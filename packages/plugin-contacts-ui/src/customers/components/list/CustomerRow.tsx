import {
  BooleanStatus,
  ClickableRow
} from '@erxes/ui-contacts/src/customers/styles';
import {
  GENDER_TYPES,
  LEAD_STATUS_TYPES
} from '@erxes/ui-contacts/src/customers/constants';
import { ICustomer, IVisitorContact } from '../../types';

import { FlexContent } from '@erxes/ui-log/src/activityLogs/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IConfigColumn } from '@erxes/ui-forms/src/settings/properties/types';
import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import PrimaryEmail from '@erxes/ui-contacts/src/customers/components/common/PrimaryEmail';
import PrimaryPhone from '@erxes/ui-contacts/src/customers/components/common/PrimaryPhone';
import React from 'react';
import Tags from '@erxes/ui/src/components/Tags';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import _ from 'lodash';
import { formatValue } from '@erxes/ui/src/utils';
import parse from 'ua-parser-js';
import { renderFlag } from '@erxes/ui-contacts/src/customers/components/common//DevicePropertiesSection';

type Props = {
  index: number;
  customer: ICustomer;
  columnsConfig: IConfigColumn[];
  history: any;
  isChecked?: boolean;
  toggleBulk: (target: any, toAdd: boolean) => void;
};

function displayObjectListItem(customer, customerFieldName, subFieldName) {
  const objectList = customer[customerFieldName] || [];
  const subFieldKey = subFieldName.replace(`${customerFieldName}.`, '');

  const subField = objectList.find
    ? objectList.find(obj => obj.field === subFieldKey)
    : [];

  if (!subField) {
    return null;
  }

  return formatValue(subField.value);
}

function displayValue(customer, name, index) {
  const value = _.get(customer, name);

  if (name === 'firstName') {
    return (
      <FlexContent>
        <NameCard.Avatar customer={customer} size={30} /> &emsp;
        {formatValue(customer.firstName)}
      </FlexContent>
    );
  }

  if (name.includes('customFieldsData')) {
    return displayObjectListItem(customer, 'customFieldsData', name);
  }

  if (name.includes('trackedData')) {
    return displayObjectListItem(customer, 'trackedData', name);
  }

  if (name === 'location.country') {
    if (customer.location && customer.location.country) {
      return (
        <>
          {renderFlag(customer.location.countryCode)} {value}
        </>
      );
    }

    return '-';
  }

  if (name.includes('userAgent')) {
    const ua = parse(value || ' ');
    return (
      <div>
        {ua.browser.name} {ua.browser.version} / {ua.os.name} {ua.os.version}
      </div>
    );
  }

  if (name === 'primaryPhone') {
    return (
      <PrimaryPhone
        phone={value}
        status={customer.phoneValidationStatus || ''}
      />
    );
  }

  if (name === 'sex') {
    return GENDER_TYPES()[value];
  }

  if (name === 'leadStatus') {
    return LEAD_STATUS_TYPES[value];
  }

  if (name === 'visitorContactInfo') {
    const visitorContactInfo =
      customer.visitorContactInfo || ({} as IVisitorContact);

    if (visitorContactInfo) {
      return formatValue(visitorContactInfo.email || visitorContactInfo.phone);
    }

    return '-';
  }

  if (name === 'sessionCount') {
    return (
      <TextInfo textStyle="primary">{value ? value.toString() : '-'}</TextInfo>
    );
  }

  if (name === 'isSubscribed' || name === 'code' || name === 'hasAuthority') {
    return <TextInfo>{value}</TextInfo>;
  }

  if (name === '#') {
    return <TextInfo>{index.toString()}</TextInfo>;
  }

  if (typeof value === 'boolean') {
    return (
      <BooleanStatus isTrue={value}>
        <Icon icon={value ? 'check-1' : 'times'} />
      </BooleanStatus>
    );
  }

  return formatValue(value);
}

function CustomerRow({
  customer = {} as ICustomer,
  columnsConfig,
  toggleBulk,
  isChecked,
  history,
  index
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
    history.push(`/contacts/details/${customer._id}`);
  };

  return (
    <tr className="crow">
      <td id="customersCheckBox" style={{ width: '50px' }} onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      {(columnsConfig || []).map(({ name }, i) => {
        if (name === 'primaryEmail') {
          return (
            <td key={i}>
              <PrimaryEmail
                customerId={customer._id}
                email={_.get(customer, name)}
                status={customer.emailValidationStatus || ''}
              />
            </td>
          );
        }

        return (
          <td key={i}>
            <ClickableRow onClick={onTrClick}>
              {displayValue(customer, name, index)}
            </ClickableRow>
          </td>
        );
      })}
      <td onClick={onTrClick}>
        <Tags tags={tags || []} limit={3} />
      </td>
    </tr>
  );
}

export default CustomerRow;
