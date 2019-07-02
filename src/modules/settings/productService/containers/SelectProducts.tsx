import { SelectWithSearch } from 'modules/common/components';
import { IOption, IQueryParams } from 'modules/common/types';
import React from 'react';
import { queries } from '../graphql';
import { IProduct } from '../types';

// get config options for react-select-plus
export function generateProductOptions(array: IProduct[] = []): IOption[] {
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
  multi = true,
  label,
  name
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  value?: string | string[];
  setParam?: boolean;
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : value;

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName="products"
      name={name}
      customQuery={queries.products}
      values={
        typeof defaultValue === 'string'
          ? multi
            ? [defaultValue]
            : defaultValue
          : defaultValue
      }
      generateOptions={generateProductOptions}
      onSelect={onSelect}
      multi={multi}
    />
  );
};
