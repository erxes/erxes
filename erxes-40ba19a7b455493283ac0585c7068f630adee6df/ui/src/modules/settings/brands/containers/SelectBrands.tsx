import SelectWithSearch from 'modules/common/components/SelectWithSearch';
import { IOption, IQueryParams } from 'modules/common/types';
import * as React from 'react';
import { queries } from '../graphql';
import { IBrand } from '../types';

// get config options for react-select-plus
export function generateBrandOptions(array: IBrand[] = []): IOption[] {
  return array.map(item => {
    const brand = item || ({} as IBrand);

    return {
      value: brand._id,
      label: brand.name || brand.code
    };
  });
}

export default ({
  queryParams,
  onSelect,
  initialValue,
  multi = true,
  label,
  name
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  setParam?: boolean;
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName="brands"
      name={name}
      customQuery={queries.brands}
      initialValue={defaultValue}
      generateOptions={generateBrandOptions}
      onSelect={onSelect}
      multi={multi}
    />
  );
};
