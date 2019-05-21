import { SelectWithSearch } from 'modules/common/components';
import { IQueryParams, Option } from 'modules/common/types';
import { queries } from 'modules/customers/graphql';
import { ICustomer } from 'modules/customers/types';
import * as React from 'react';

function selectCustomerOptions(array: ICustomer[] = []): Option[] {
  return array.map(item => {
    const customer = item || ({} as ICustomer);

    return {
      value: customer._id,
      label: customer.firstName,
      avatar: customer.avatar
    };
  });
}

export default ({
  queryParams,
  onSelect,
  value,
  setParam = true,
  multi = true,
  label
}: {
  queryParams: IQueryParams;
  label: string;
  onSelect: (value: string, name: string) => void;
  multi?: boolean;
  customOption?: Option;
  value?: string;
  setParam?: boolean;
}) => {
  const name = 'customerIds';
  const defaultValue = setParam ? queryParams[name] : value;

  return (
    <SelectWithSearch
      label={label}
      queryName="customers"
      name={name}
      customQuery={queries.customers}
      value={defaultValue}
      options={selectCustomerOptions}
      onSelect={onSelect}
      multi={multi}
    />
  );
};
