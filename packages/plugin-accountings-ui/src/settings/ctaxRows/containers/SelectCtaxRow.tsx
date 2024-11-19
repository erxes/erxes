import { IOption, IQueryParams } from '@erxes/ui/src/types';

import { ICtaxRow } from '../types';
import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { queries } from '../graphql';

// get config options for react-select
export function generateCtaxRowOptions(
  array: ICtaxRow[] = []
): IOption[] {
  return array.map(item => {
    const ctaxRow = item || ({} as ICtaxRow);

    let space = '';

    return {
      value: ctaxRow._id,
      label: `${space} - ${ctaxRow.name}`,
      obj: ctaxRow
    };
  });
}

const SelectCtaxRow = ({
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
  onSelect: (values: string[] | string, obj?: ICtaxRow, name?: string, extraValue?: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  filterParams?: {
    ids?: string[];
    status?: string;
    searchValue?: string;
    withoutUserFilter?: boolean;
    journals?: string[];
  };
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const onSelected = (id: string[] | string, name: string, extraValue?: string, obj?: any) => {
    onSelect(id, obj, name, extraValue);
  }

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName="ctaxRows"
      name={name}
      customQuery={queries.ctaxRows}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateCtaxRowOptions}
      onSelect={onSelected}
      multi={multi}
      customOption={customOption}
    />
  );
};

export default SelectCtaxRow;