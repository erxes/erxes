import { SelectWithSearch } from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';

import { queries } from '../graphql';
import { IContractType } from '../types';

// get contractType options for react-select
export function generateContractTypeOptions(
  array: IContractType[] = []
): IOption[] {
  return array.map(item => {
    const contractType = item || ({} as IContractType);

    return {
      value: contractType._id,
      label: `${contractType.code || ''} - ${contractType.name || ''}`,
      obj: contractType
    };
  });
}

export default ({
  queryParams,
  onSelect,
  initialValue,
  multi = false,
  customOption,
  label,
  name,
  filterParams,
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, obj?: IContractType, name?: string, extraValue?: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  filterParams?: {
    ids?: string[];
    status?: string;
    searchValue?: string;
  };
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const onSelected = (id: string[] | string, name: string, extraValue?: string, obj?: any) => {
    onSelect(id, obj, name, extraValue);
  }

  return (
    <SelectWithSearch
      label={label}
      queryName="contractTypes"
      name={name}
      customQuery={queries.contractTypes}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateContractTypeOptions}
      onSelect={onSelected}
      multi={multi}
      customOption={customOption}
    />
  );
};
