import { SelectWithSearch } from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';

import { queries } from '../graphql';
import { IContract } from '../types';

// get contract options for react-select-plus
export function generateContractOptions(
  array: IContract[] = [],
  useFields?: string[]
): IOption[] {
  return array.map(item => {
    const contract = item || ({} as IContract);

    ContractById[contract._id] = contract;

    return {
      value: contract._id,
      label: `${contract.number || ''}`
    };
  });
}

export interface IFilterParams {
  [key: string]: string | Date;
}

export let ContractById = {};

export default ({
  queryParams,
  onSelect,
  value,
  multi = true,
  label,
  name,
  customOption,
  filterParams,
  disabled
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  value?: string | string[];
  name: string;
  filterParams: IFilterParams;
  disabled?: boolean;
}) => {
  const defaultValue = queryParams ? queryParams[name] : value;
  return (
    <SelectWithSearch
      label={label}
      queryName="contracts"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateContractOptions}
      onSelect={onSelect}
      customQuery={queries.contracts}
      multi={multi}
      disabled={disabled}
      filterParams={filterParams}
      customOption={customOption}
    />
  );
};
