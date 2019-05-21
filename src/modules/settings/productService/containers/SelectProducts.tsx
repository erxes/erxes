import { SelectWithSearch } from 'modules/common/components';
import { IQueryParams, Option } from 'modules/common/types';
import * as React from 'react';
import { queries } from '../graphql';
import { IProduct } from '../types';

// get config options for react-select-plus
export function selectProductOptions(array: IProduct[] = []): Option[] {
  return array.map(item => {
    const product = item || ({} as IProduct);

    return {
      value: product._id,
      label: product.name
    };
  });
}

export default ({
  queryParams,
  onSelect,
  value,
  setParam = true,
  multi = true,
  label
}: {
  queryParams: IQueryParams;
  label: string;
  onSelect: (value: string, name: string) => void;
  multi?: boolean;
  customOption?: Option;
  value?: string;
  setParam?: boolean;
}) => {
  const name = 'productIds';
  const defaultValue = setParam ? queryParams[name] : value;

  return (
    <SelectWithSearch
      label={label}
      queryName="products"
      name={name}
      customQuery={queries.products}
      value={defaultValue}
      options={selectProductOptions}
      onSelect={onSelect}
      multi={multi}
    />
  );
};
