import { SelectWithSearch } from 'modules/common/components';
import { IQueryParams, Option } from 'modules/common/types';
import * as React from 'react';
import { queries } from '../graphql';
import { ICompany } from '../types';

// get company options for react-select-plus
export function selectCompanyOptions(array: ICompany[] = []): Option[] {
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
  value,
  multi = true,
  label
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string, name: string) => void;
  multi?: boolean;
  customOption?: Option;
  value?: string;
  setParam?: boolean;
}) => {
  const name = 'companyIds';
  const defaultValue = queryParams ? queryParams[name] : value;

  return (
    <SelectWithSearch
      label={label}
      queryName="companies"
      name={name}
      value={defaultValue}
      options={selectCompanyOptions}
      onSelect={onSelect}
      customQuery={queries.companies}
      multi={multi}
    />
  );
};
