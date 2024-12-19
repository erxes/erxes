import SelectWithSearch from '../../components/SelectWithSearch';
import { IOption, IQueryParams } from '../../types';
import React from 'react';
import { IBranch } from '@erxes/ui/src/team/types';
import {
  commonStructureParamsDef,
  commonStructureParamsValue,
} from '../graphql/queries';

// get user options for react-select
export function generateBranchOptions(array: IBranch[] = []): IOption[] {
  return array.map(item => ({
    label: `${item.code} - ${item.title}`,
    value: item._id,
  }));
}

const branchesQuery = `
  query branches(${commonStructureParamsDef}, $withoutUserFilter: Boolean) {
    branches (${commonStructureParamsValue}, withoutUserFilter: $withoutUserFilter){
      _id,
      code,
      title,
      parentId
    }
  }
`;

export default (props: {
  queryParams?: IQueryParams;
  filterParams?: {
    ids?: string[];
    status?: string;
    searchValue?: string;
    withoutUserFilter?: boolean;
  };
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
}) => {
  const {
    queryParams,
    onSelect,
    customOption,
    initialValue,
    multi = true,
    label,
    filterParams,
    name,
  } = props;
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      label={label}
      queryName="branches"
      name={name}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateBranchOptions}
      onSelect={onSelect}
      customQuery={branchesQuery}
      customOption={customOption}
      multi={multi}
    />
  );
};
