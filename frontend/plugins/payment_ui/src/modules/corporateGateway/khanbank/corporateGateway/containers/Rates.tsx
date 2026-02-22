import { gql, useQuery } from '@apollo/client';
import { RatesQueryResponse } from '../../../types';
import Rates from '../components/Rates';
import queries from '../graphql/queries';

const RateList = () => {
  const { data, loading, error } =
    useQuery<RatesQueryResponse>(
      gql(queries.ratesQuery),
      {
        fetchPolicy: 'network-only',
      },
    );

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <span className="text-sm text-muted-foreground">
          Loading rates...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive p-4">
        {error.message}
      </div>
    );
  }

  const rates = data?.khanbankRates ?? [];

  return <Rates rates={rates} />;
};

export default RateList;