import React from 'react';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import Select from 'react-select-plus';
import { ProductCategoriesQueryResponse } from 'modules/settings/productService/types';

type Props = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
  onChange: () => void;
  value: string;
  placeholder: string;
};

function SelectProductCategory(props: Props) {
  const { productCategoriesQuery, onChange, value, placeholder } = props;

  if (productCategoriesQuery.loading) {
    return null;
  }
  const { productCategories } = productCategoriesQuery;
  const mainCategory = productCategories.filter(item => item.isRoot);

  return (
    <Select
      options={mainCategory.map(el => ({
        label: el.name,
        value: el._id
      }))}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
    />
  );
}

export default compose(
  graphql<{}, ProductCategoriesQueryResponse, { parentId: string }>(
    gql(queries.productCategories),
    {
      name: 'productCategoriesQuery'
    }
  )
)(SelectProductCategory);
