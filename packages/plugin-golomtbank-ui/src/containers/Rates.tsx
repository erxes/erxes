import Spinner from '@erxes/ui/src/components/Spinner';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { RatesQueryResponse } from '../types';
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

  const rates = (data && data.golomtBankRates) || [];

  return (
      <Rates rates={rates} />
  );
};

export default RateList;
