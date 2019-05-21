import { SelectWithSearch } from 'modules/common/components';
import * as React from 'react';
import { queries } from '../graphql';
import { IProduct } from '../types';

// get config options for react-select-plus
export function selectProductOptions(array: IProduct[] = []) {
  return array.map(item => {
    const product = item || ({} as IProduct);

    return {
      value: product._id,
      label: product.name
    };
  });
}

export default ({ queryParams, onSelect }) => (
  <SelectWithSearch
    label="Choose products"
    queryName="products"
    name="productIds"
    customQuery={queries.products}
    value={queryParams.productIds}
    options={selectProductOptions}
    onSelect={onSelect}
  />
);
