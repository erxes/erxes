import { IOption, IQueryParams } from '@erxes/ui/src/types';

import { ICompany } from '../types';
import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { queries } from '../graphql';

// get company options for react-select-plus
export function generateCompanyOptions(array: ICompany[] = []): IOption[] {
  return array.map(item => {
    const company = item || ({} as ICompany);

    return {
      value: company._id,
      label: company.primaryName || '',
      avatar: company.avatar
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
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      label={label}
      queryName="companies"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateCompanyOptions}
      onSelect={onSelect}
      customQuery={queries.companies}
      customOption={customOption}
      multi={multi}
    />
  );
};
