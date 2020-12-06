import SelectWithSearch from 'modules/common/components/SelectWithSearch';
import { IOption, IQueryParams } from 'modules/common/types';
import { renderFullName } from 'modules/common/utils';
import { queries } from 'modules/customers/graphql';
import { ICustomer } from 'modules/customers/types';
import React from 'react';

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
      multi={multi}
    />
  );
};
