import React from 'react';
import { useQuery } from 'react-apollo';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { Alert } from '@erxes/ui/src/utils';
// local
import { queries } from '../../graphql';
import BarcodeGeneratorComponent from '../../components/barcodeGenerator/BarcodeGenerator';

type Props = {
  queryParams: any;
  id: string;
};

const BarcodeGeneratorContainer = (props: Props) => {
  const { id, queryParams } = props;

  const product = useQuery(gql(queries.productDetail), {
    variables: { _id: id },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  return (
    <BarcodeGeneratorComponent
      barcode={queryParams.barcode}
      product={product.data ? product.data.productDetail : {}}
    />
  );
};

export default BarcodeGeneratorContainer;
