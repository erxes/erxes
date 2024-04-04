import { IOption, IQueryParams } from '@erxes/ui/src/types';

import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';

import queries from '../../graphql/queries';
import { IContract } from '../../types';

function generateCustomerOptions(array: IContract[] = []): IOption[] {
  return array.map(item => {
    const contract = item || ({} as IContract);
    Contracts[contract._id] = contract;
    return {
      value: contract._id,
      label: `${contract.number}`
    };
  });
}

export let Contracts = {};

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
      queryName="contracts"
      name={name}
      customQuery={queries.contracts}
      initialValue={defaultValue}
      generateOptions={generateCustomerOptions}
      onSelect={onSelect}
      filterParams={{ status: 'normal' }}
      customOption={customOption}
      multi={multi}
    />
  );
};
