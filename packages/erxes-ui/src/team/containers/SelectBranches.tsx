import SelectWithSearch from '../../components/SelectWithSearch';
import { IOption, IQueryParams } from '../../types';
import React from 'react';
import { queries } from '../graphql';
import { IBranch } from '@erxes/ui/src/team/types';
import { generateTree } from '../../utils';

// get user options for react-select-plus
export function generateBranchOptions(array: IBranch[] = []): IOption[] {
  const generateList = () => {
    const list = array.map(item => {
      if (!array.find(dep => dep._id === item.parentId)) {
        item.parentId = null;
      }
      return item;
    });
    return list;
  };

  return generateTree(generateList(), null, (node, level) => ({
    value: node._id,
    label: `${'\u00A0 \u00A0 '.repeat(level)} ${node.title}`
  }));
}

export default (props: {
  queryParams?: IQueryParams;
  filterParams?: {
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
    name
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
      customQuery={queries.branches}
      customOption={customOption}
      multi={multi}
    />
  );
};
