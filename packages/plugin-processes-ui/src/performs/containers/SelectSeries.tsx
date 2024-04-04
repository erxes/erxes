import React from 'react';

import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../graphql';

export function generateProductOptions(array: any[] = []): IOption[] {
  return array.map(item => ({
    value: item._id,
    label: `${item.series}`
  }));
}

export default ({
  queryParams,
  onSelect,
  initialValue,
  multi = true,
  customOption,
  label,
  name,
  filterParams
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  setParam?: boolean;
  name: string;
  filterParams?: any;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName="series"
      name={name}
      customQuery={queries.series}
      initialValue={defaultValue}
      generateOptions={generateProductOptions}
      onSelect={onSelect}
      multi={multi}
      customOption={customOption}
      filterParams={filterParams}
    />
  );
};
