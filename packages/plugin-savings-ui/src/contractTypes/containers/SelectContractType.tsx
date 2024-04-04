import { SelectWithSearch } from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';

import { queries } from '../graphql';
import { IContractType } from '../types';

// get contractType options for react-select-plus
export function generateContractTypeOptions(
  array: IContractType[] = [],
  useFields?: string[]
): IOption[] {
  return array.map(item => {
    const contractType = item || ({} as IContractType);

    ContractTypeById[contractType._id] = contractType;

    return {
      value: contractType._id,
      label: `${contractType.code || ''} - ${contractType.name || ''}`
    };
  });
}

export let ContractTypeById = {};

export default ({
  queryParams,
  onSelect,
  value,
  multi = true,
  label,
  name,
  disabled
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  value?: string | string[];
  name: string;
  disabled?: boolean;
}) => {
  const defaultValue = queryParams ? queryParams[name] : value;

  return (
    <SelectWithSearch
      label={label}
      queryName="savingsContractTypes"
      name={name}
      disabled={disabled}
      initialValue={defaultValue}
      generateOptions={generateContractTypeOptions}
      onSelect={onSelect}
      customQuery={queries.contractTypes}
      multi={multi}
    />
  );
};
