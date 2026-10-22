import { useQuery } from '@apollo/client';
import { GET_JOB_OUTPUTS } from '../graphql/jobQueries';
import { useJobFilters } from './useJobFilters';

export const useJobOutputs = () => {
  const filters = useJobFilters(true);
  const { data, loading, error, refetch, fetchMore } = useQuery(
    GET_JOB_OUTPUTS,
    {
      variables: { ...filters, page: 1, perPage: 20 },
      notifyOnNetworkStatusChange: true,
    },
  );
  const rows = data?.jobOutputs?.rows ?? [];
  const totalCount = data?.jobOutputs?.totalCount ?? 0;
  const handleFetchMore = () => {
    if (loading || !rows.length || rows.length >= totalCount) return;
    void fetchMore({
      variables: { page: Math.ceil(rows.length / 20) + 1 },
      updateQuery: (prev, { fetchMoreResult }) => ({
        jobOutputs: {
          ...fetchMoreResult.jobOutputs,
          totalCount:
            fetchMoreResult.jobOutputs?.totalCount ??
            prev.jobOutputs?.totalCount ??
            0,
          rows: [
            ...(prev.jobOutputs?.rows ?? []),
            ...(fetchMoreResult.jobOutputs?.rows ?? []),
          ],
        },
      }),
    });
  };
  return { rows, totalCount, loading, error, refetch, handleFetchMore };
};
