import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';
import { RatesQueryResponse } from '../../../types';
import Rates from '../components/Rates';
import queries from '../graphql/queries';

const RateList = () => {
  const { data, loading } = useQuery<RatesQueryResponse>(
    gql(queries.ratesQuery),
    {
      fetchPolicy: 'network-only'
    }
  );

  if (loading) {
    return <Spinner />;
  }

  const rates = (data && data.khanbankRates) || [];

  return (
    <>
      <Rates rates={rates} />
    </>
  );
};

export default RateList;
