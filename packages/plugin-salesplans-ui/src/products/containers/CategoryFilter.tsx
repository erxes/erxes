import { useQuery } from 'react-apollo';
import React from 'react';
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
    />
  );
};

export default CategoryFilterContainer;
