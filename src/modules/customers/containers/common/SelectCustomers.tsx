import { SelectWithSearch } from 'modules/common/components';
import { Option } from 'modules/common/types';
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

export default ({ queryParams, onSelect }) => (
  <SelectWithSearch
    label="Choose customers"
    queryName="customers"
    name="customerIds"
    customQuery={queries.customers}
    value={queryParams.customerIds}
    options={selectCustomerOptions}
    onSelect={onSelect}
  />
);
