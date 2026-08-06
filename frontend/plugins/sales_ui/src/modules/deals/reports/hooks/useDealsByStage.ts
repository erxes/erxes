import { useQuery } from '@apollo/client';
import { DEALS_BY_STAGE } from '../graphql/queries/queries';

export const useDealsByStage = (
  filters: any,
  sort = '-createdAt',
  limit = 20,
  skip = 0
) => {
  const { data, loading, error, refetch, fetchMore } = useQuery(DEALS_BY_STAGE, {
    variables: { filters, sort, limit, skip },
  });

  return {
    stages: data?.dealsByStage || [],
    loading,
    error,
    refetch,
    fetchMore,
  };
};