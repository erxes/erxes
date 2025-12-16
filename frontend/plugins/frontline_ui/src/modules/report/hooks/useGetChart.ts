import { useQuery } from '@apollo/client';
import { GET_CHART } from '@/report/graphql/queries/getChart';

export const useGetChart = () => {
  const { data, loading, error } = useQuery(GET_CHART);

  return {
    chartData: data?.chartGetResult,
    loading,
    error,
  };
};
