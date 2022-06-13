import SelectWithSearch from '../../components/SelectWithSearch';
import { IOption, IQueryParams } from '../../types';
import React from 'react';
import { departments } from '../graphql';
import { IDepartment } from '@erxes/ui-team/src/types';

// get user options for react-select-plus
export function generateUserOptions(array: IDepartment[] = []): IOption[] {
  return array.map(item => {
    const department = item || ({} as IDepartment);

    return {
      value: department._id,
      label: `${department.title} (${department.code})`
    };
  });
}

export default (props: {
  queryParams?: IQueryParams;
  filterParams?: { status: string };
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
      customQuery={departments}
      customOption={customOption}
      multi={multi}
    />
  );
};
