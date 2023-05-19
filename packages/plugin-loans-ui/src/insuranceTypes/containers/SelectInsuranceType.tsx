import { SelectWithSearch } from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';

import { queries } from '../graphql';
import { IInsuranceType } from '../types';

// get insuranceType options for react-select-plus
export function generateInsuranceTypeOptions(
  array: IInsuranceType[] = []
): IOption[] {
  return array.map(item => {
    const insuranceType = item || ({} as IInsuranceType);

    return {
      value: insuranceType._id,
      label: `${insuranceType.name || ''}`
    };
  });
}

export default ({
  queryParams,
  onSelect,
  value,
  multi = true,
  label,
  name
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  value?: string | string[];
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : value;

  return (
    <SelectWithSearch
      label={label}
      queryName="insuranceTypes"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateInsuranceTypeOptions}
      onSelect={onSelect}
      customQuery={queries.insuranceTypes}
      multi={multi}
    />
  );
};
