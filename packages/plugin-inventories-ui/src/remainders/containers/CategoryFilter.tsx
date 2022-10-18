import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
// local
import CategoryFilterComponent from '../components/CategoryFilter';
import { queries } from '../graphql';

const CategoryFilterContainer = () => {
  const productCategoriesQuery = useQuery(gql(queries.productCategories), {
    fetchPolicy: 'network-only'
  });

  const productCategories =
    (productCategoriesQuery.data &&
      productCategoriesQuery.data.productCategories) ||
    [];

  return (
    <CategoryFilterComponent
      categories={productCategories}
      loading={productCategoriesQuery.loading}
    />
  );
};

export default CategoryFilterContainer;
