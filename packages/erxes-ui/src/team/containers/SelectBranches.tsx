import SelectWithSearch from '../../components/SelectWithSearch';
import { IOption, IQueryParams } from '../../types';
import React from 'react';
import { branches } from '../graphql';
import { IBranch } from '@erxes/ui-team/src/types';

// get user options for react-select-plus
export function generateUserOptions(array: IBranch[] = []): IOption[] {
  return array.map(item => {
    const branch = item || ({} as IBranch);

    return {
      value: branch._id,
      label: `${branch.title} (${branch.code})`
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
      queryName="branches"
      name={name}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateUserOptions}
      onSelect={onSelect}
      customQuery={branches}
      customOption={customOption}
      multi={multi}
    />
  );
};
