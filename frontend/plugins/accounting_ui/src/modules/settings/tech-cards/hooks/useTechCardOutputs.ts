import { useQuery } from '@apollo/client';
import { GET_TECH_CARD_OUTPUTS } from '../graphql/techCardQueries';
import { ITechCardOutputRow } from '../types/TechCard';
import { useTechCardFilters } from './useTechCardFilters';

export const useTechCardOutputs = () => {
  const filters = useTechCardFilters(true);
  const { data, loading, error, refetch, fetchMore } = useQuery<{
    techCardOutputs: { rows: ITechCardOutputRow[]; totalCount: number };
  }>(GET_TECH_CARD_OUTPUTS, {
    variables: { ...filters, page: 1, perPage: 20 },
    notifyOnNetworkStatusChange: true,
  });
  const rows = data?.techCardOutputs.rows ?? [];
  const totalCount = data?.techCardOutputs.totalCount ?? 0;
  const handleFetchMore = () => {
    if (loading || !rows.length || rows.length >= totalCount) return;
    void fetchMore({
      variables: { page: Math.ceil(rows.length / 20) + 1 },
      updateQuery: (prev, { fetchMoreResult }) => ({
        techCardOutputs: {
          ...fetchMoreResult.techCardOutputs,
          rows: [
            ...prev.techCardOutputs.rows,
            ...fetchMoreResult.techCardOutputs.rows,
          ],
        },
      }),
    });
  };
  return { rows, totalCount, loading, error, refetch, handleFetchMore };
};
