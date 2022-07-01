import React from 'react';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';
import gql from 'graphql-tag';
import ProductsComponent from '../components/Products';

const ProductsContainer = () => {
  const productCategoriesQuery = useQuery(gql(queries.productCategories));

  return (
    <ProductsComponent
      categories={
        productCategoriesQuery.data
          ? productCategoriesQuery.data.productCategories
          : []
      }
    />
  );
};

export default ProductsContainer;
