import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import { DataWithLoader } from '@erxes/ui/src';
import gql from 'graphql-tag';
import queryString from 'query-string';
import FormComponent from '../components/Form';

const FormContainer = () => {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const salesLogId = query.salesLogId ? query.salesLogId : '';
  const categoryId = query.categoryId ? query.categoryId : '';

  const productsQuery = useQuery(gql(queries.products));
  const timeframesQuery = useQuery(gql(queries.timeframes));
  const salesLogQuery = useQuery(gql(queries.getSalesLogDetail), {
    variables: { salesLogId }
  });

  const [update] = useMutation(gql(mutations.salesLogProductUpdate));
  const [remove] = useMutation(gql(mutations.salesLogProductRemove));

  const productUpdate = (doc: any) => {
    update({ variables: { id: salesLogId, productData: doc } })
      .then(() => {
        Alert.success('Request successful!');
        salesLogQuery.refetch();
      })
      .catch((error: any) => {
        Alert.error(error.message);
      });
  };

  const productRemove = (doc: any) => {
    remove({ variables: { id: salesLogId, productId: doc } })
      .then(() => {
        Alert.success('Request successful!');
        salesLogQuery.refetch();
      })
      .catch((error: any) => {
        Alert.error(error.message);
      });
  };

  return (
    <DataWithLoader
      data={
        <FormComponent
          products={productsQuery.data && productsQuery.data.products}
          timeframes={
            timeframesQuery.data && timeframesQuery.data.getTimeframes
          }
          categoryId={categoryId}
          data={salesLogQuery.data && salesLogQuery.data.getSalesLogDetail}
          update={productUpdate}
          remove={productRemove}
        />
      }
      loading={salesLogQuery.loading}
    />
  );
};

export default FormContainer;
