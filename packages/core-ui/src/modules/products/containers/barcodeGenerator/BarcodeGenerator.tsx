import React from 'react';
import { useQuery } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';

//erxes
import { Alert } from '@erxes/ui/src/utils';
import Spinner from '@erxes/ui/src/components/Spinner';

// local
import BarcodeGeneratorComponent from '../../components/barcodeGenerator/BarcodeGenerator';
import { queries } from '../../graphql';
import { IProduct } from '../../types';

type Props = {
  queryParams: any;
  id: string;
};

const BarcodeGeneratorContainer = (props: Props) => {
  const { id, queryParams } = props;

  const productDetailQuery: any = useQuery(gql(queries.productDetail), {
    variables: { _id: id },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  if (productDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  const productDetail = productDetailQuery.data
    ? productDetailQuery.data.productDetail
    : ({} as IProduct);

  return (
    <BarcodeGeneratorComponent
      barcode={queryParams.barcode}
      product={productDetail}
    />
  );
};

export default BarcodeGeneratorContainer;
