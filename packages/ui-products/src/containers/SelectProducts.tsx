import React from 'react';

import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../graphql';
import { IProduct } from '../types';

// get config options for react-select
export function generateProductOptions(array: IProduct[] = []): IOption[] {
  return array.map(item => {
    const product = item || ({} as IProduct);

    if (product.code && product.subUoms?.length) {
      return {
        value: product._id,
        label: `${product.code} - ${product.name} ~${Math.round(
          (1 / (product.subUoms[0].ratio || 1)) * 100
        ) / 100}`
      };
    }

    return {
      value: product._id,
      label: `${product.code} - ${product.name}`
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
      queryName="products"
      name={name}
      customQuery={queries.products}
      initialValue={defaultValue}
      generateOptions={generateProductOptions}
      onSelect={onSelect}
      multi={multi}
      customOption={customOption}
      filterParams={filterParams}
    />
  );
};
