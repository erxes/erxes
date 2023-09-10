import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql, ChildProps } from '@apollo/client/react/hoc';

import SelectCategories from '../components/SelectProductCategory';
import { queries } from '../graphql';
import { ProductCategoriesQueryResponse } from '../types';

type Props = {
  onChange: (values: string[]) => void;
  defaultValue: string[];
};

type FinalProps = {
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props;

const SelectCategoryContainer = (props: ChildProps<FinalProps>) => {
  const { productCategoriesQuery } = props;

  const categories = productCategoriesQuery.productCategories || [];

  if (productCategoriesQuery.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    categories
  };

  return <SelectCategories {...updatedProps} />;
};

export default compose(
  graphql<ProductCategoriesQueryResponse>(gql(queries.productCategories), {
    name: 'productCategoriesQuery',
    options: () => ({
      variables: {
        status: 'active'
      }
    })
  })
)(SelectCategoryContainer);
