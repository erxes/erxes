import { IOption, IQueryParams } from '@erxes/ui/src/types';

import { ICustomer } from '../types';
import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { queries } from '../graphql';
import { renderFullName } from '@erxes/ui/src/utils';

function generateCustomerOptions(array: ICustomer[] = []): IOption[] {
  return array.map(item => {
    const customer = item || ({} as ICustomer);

    return {
      value: customer._id,
      label: renderFullName(customer),
      avatar: customer.avatar
    };
  });
}

export default ({
  queryParams,
  onSelect,
  initialValue,
  multi = true,
  customOption,
  label,
  name
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      label={label}
      queryName="customers"
      name={name}
      customQuery={queries.customers}
      initialValue={defaultValue}
      generateOptions={generateCustomerOptions}
      onSelect={onSelect}
      customOption={customOption}
      multi={multi}
    />
  );
};
