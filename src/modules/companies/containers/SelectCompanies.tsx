import { SelectWithSearch } from 'modules/common/components';
import * as React from 'react';
import { queries } from '../graphql';
import { ICompany } from '../types';

// get company options for react-select-plus
export function selectCompanyOptions(array: ICompany[] = []) {
  return array.map(item => {
    const company = item || ({} as ICompany);

    return {
      value: company._id,
      label: company.primaryName,
      avatar: company.avatar
    };
  });
}

export default ({ queryParams, onSelect }) => (
  <SelectWithSearch
    label="Choose companies"
    queryName="companies"
    name="companyIds"
    customQuery={queries.companies}
    value={queryParams.companyIds}
    options={selectCompanyOptions}
    onSelect={onSelect}
  />
);
