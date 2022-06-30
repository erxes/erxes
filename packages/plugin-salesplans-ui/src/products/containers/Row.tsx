import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation } from 'react-apollo';
import { mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import queryString from 'query-string';
import RowComponent from '../components/Row';

type Props = {
  product: any;
  productSales: any;
  status: string;
  type: string;
  timeframes: any[];
  refetch: () => void;
};

const RowContainer = (props: Props) => {
  const { refetch } = props;
  const location = useLocation();
  const query = queryString.parse(location.search);
  const { salesLogId = '' } = query;

  const [update] = useMutation(gql(mutations.salesLogProductUpdate));
  const [remove] = useMutation(gql(mutations.salesLogProductRemove));

  const productUpdate = (data: any) => {
    update({ variables: { id: salesLogId, data: data } })
      .then(() => {
        Alert.success('Request successful!');
      })
      .catch((error: any) => {
        Alert.error(error.message);
      });
  };

  const productRemove = (data: any) => {
    remove({ variables: { id: salesLogId, productId: data } })
      .then(() => {
        Alert.success('Request successful!');
        refetch();
      })
      .catch((error: any) => {
        Alert.error(error.message);
      });
  };

  return (
    <RowComponent {...props} update={productUpdate} remove={productRemove} />
  );
};

export default RowContainer;
