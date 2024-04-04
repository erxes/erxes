import SelectWithSearch from '../../components/SelectWithSearch';
import { IOption, IQueryParams } from '../../types';
import React from 'react';
import { IDepartment } from '@erxes/ui/src/team/types';
import { generateTree } from '../../utils';
import {
  commonStructureParamsDef,
  commonStructureParamsValue
} from '../graphql/queries';

// get user options for react-select-plus
export function generateUserOptions(array: IDepartment[] = []): IOption[] {
  const generateList = () => {
    const list = array.map(item => {
      if (!array.find(dep => dep._id === item.parentId)) {
        return { ...item, parentId: null };
      }
      return item;
    });
    return list;
  };

  return generateTree(generateList(), null, (node, level) => ({
    value: node._id,
    label: `${'\u00A0 \u00A0 '.repeat(level)} ${node.code} - ${node.title}`
  }));
}

const departmentsQuery = `
  query departments(${commonStructureParamsDef}, $withoutUserFilter: Boolean) {
    departments(${commonStructureParamsValue}, withoutUserFilter: $withoutUserFilter) {
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
    withoutUserFilter: boolean;
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
      queryName="departments"
      name={name}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateUserOptions}
      onSelect={onSelect}
      customQuery={departmentsQuery}
      customOption={customOption}
      multi={multi}
    />
  );
};
