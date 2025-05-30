import React from 'react';

import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../graphql';
import { IProductRule } from '../types';

// get config options for react-select
export function generateProductOptions(array: IProductRule[] = []): IOption[] {
  return array.map(item => {
    const rule = item || ({} as IProductRule);

    return {
      value: rule._id,
      label: rule.name
    };
  });
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
      queryName="productRules"
      name={name}
      customQuery={queries.productRules}
      initialValue={defaultValue}
      generateOptions={generateProductOptions}
      onSelect={onSelect}
      multi={multi}
      customOption={customOption}
      filterParams={filterParams}
    />
  );
};
