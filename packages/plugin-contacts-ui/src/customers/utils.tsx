import { LEAD_STATUS_TYPES } from '@erxes/ui-contacts/src/customers/constants';
import { formatValue } from '@erxes/ui/src/utils/core';

import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { ICompany } from '@erxes/ui-contacts/src/companies/types';

export const leadStatusChoices = (__) => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(LEAD_STATUS_TYPES)) {
    options.push({
      value: key,
      label: __(LEAD_STATUS_TYPES[key]),
    });
  }

  return options;
};

export const displayObjectListItem = (
  contact: ICustomer | ICompany,
  customFieldName: string,
  subFieldName: string,
  group?: string,
) => {
  const objectList = contact[customFieldName] || [];
  const subFieldKey = subFieldName.replace(`${customFieldName}.`, '');

  let subField = objectList.find((obj) => obj.field === subFieldKey);

  if (!subField && group) {
    const subFieldGroup = objectList.find((obj) => obj.field === group);

    if (!subFieldGroup) {
      return null;
    }
    const values = subFieldGroup.value || [];

    let value = '';

    values.forEach((val) => {
      if (val[subFieldKey]) {
        value += `${val[subFieldKey]}, `;
      }
    });

    if (value) {
      value = value.slice(0, -2);
    }

    return formatValue(value);
  }

  if (!subField && !group) {
    return null;
  }

  return formatValue(subField.value);
};
