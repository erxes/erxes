import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import Spinner from '@erxes/ui/src/components/Spinner';

// local
import SeriesPrint from '../components/SeriesPrint';
import { queries } from '../graphql';
import { IPerform } from '../types';

type Props = {
  id: string;
};

const BarcodeGeneratorContainer = (props: Props) => {
  const { id } = props;

  const performDetailQuery: any = useQuery(gql(queries.performDetail), {
    variables: { _id: id },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  if (performDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  const performDetail = performDetailQuery.data
    ? performDetailQuery.data.performDetail
    : ({} as IPerform);

  return (
    <SeriesPrint perform={performDetail} keyValue={performDetail.series} />
  );
};

export default BarcodeGeneratorContainer;
