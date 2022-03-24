import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { queries } from '../graphql';
import { ICar } from '../types';

// get car options for react-select-plus
export function generateCarOptions(array: ICar[] = []): IOption[] {
  return array.map(item => {
    const car = item || ({} as ICar);

    return {
      value: car._id,
      label: car.plateNumber || ''
    };
  });
}

export default ({
  queryParams,
  onSelect,
  value,
  multi = true,
  label,
  name
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  value?: string | string[];
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : value;

  return (
    <SelectWithSearch
      label={label}
      queryName="cars"
      name={name}
      values={
        typeof defaultValue === 'string'
          ? multi
            ? [defaultValue]
            : defaultValue
          : defaultValue
      }
      generateOptions={generateCarOptions}
      onSelect={onSelect}
      customQuery={queries.cars}
      multi={multi}
    />
  );
};
