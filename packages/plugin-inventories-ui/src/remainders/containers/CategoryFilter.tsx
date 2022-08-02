import * as compose from 'lodash.flowright';

import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { queries } from '../graphql';
import CategoryFilterComponent from '../components/CategoryFilter';

const CategoryFilterContainer = () => {
  const productCategoriesQuery = useQuery(gql(queries.productCategories), {
    fetchPolicy: 'network-only'
  });

  return (
    <CategoryFilterComponent
      categories={
        productCategoriesQuery.data
          ? productCategoriesQuery.data.productCategories
          : []
      }
      loading={productCategoriesQuery.loading}
    />
  );
};

export default CategoryFilterContainer;
