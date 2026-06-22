import { useQuery } from '@apollo/client';
import { FORECAST_REVENUE } from '../graphql/queries/queries';

export const useForecast = (filters: any) => {
  const { data, loading, error, refetch } = useQuery(FORECAST_REVENUE, {
    variables: { filters },
  });

  return {
    forecast: data?.forecastRevenue,
    loading,
    error,
    refetch,
  };
};