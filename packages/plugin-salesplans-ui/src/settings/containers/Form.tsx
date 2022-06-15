import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';
import Form from '../components/Form';

const FormContainer = (props: any) => {
  const productsQuery = useQuery(gql(queries.products));
  const productCategoriesQuery = useQuery(gql(queries.productCategories));
  const getTimeframesQuery = useQuery(gql(queries.getTimeframes));

  return (
    <Form
      {...props}
      products={productsQuery.data ? productsQuery.data.products : []}
      categories={
        productCategoriesQuery.data
          ? productCategoriesQuery.data.productCategories
          : []
      }
      timeframes={
        getTimeframesQuery.data ? getTimeframesQuery.data.getTimeframes : []
      }
    />
  );
};

export default FormContainer;
