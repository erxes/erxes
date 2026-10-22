import { useQuery } from '@apollo/client';
import { GET_JOBS } from '../graphql/jobQueries';
import { useJobFilters } from './useJobFilters';

const JOB_PER_PAGE = 20;

export const useJobs = () => {
  const filters = useJobFilters();
  const { data, loading, fetchMore, error, refetch } = useQuery(GET_JOBS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      ...filters,
      page: 1,
      perPage: JOB_PER_PAGE,
      sortField: 'modifiedAt',
      sortDirection: -1,
    },
  });

  const rows = (data?.jobs?.jobs ?? []).flatMap((job) => (job ? [job] : []));

  const handleFetchMore = () => {
    if (
      loading ||
      !rows.length ||
      rows.length >= (data?.jobs?.totalCount ?? 0)
    ) {
      return;
    }

    fetchMore({
      variables: {
        page: Math.ceil(rows.length / JOB_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => ({
        jobs: {
          ...prev.jobs,
          totalCount:
            fetchMoreResult.jobs?.totalCount ?? prev.jobs?.totalCount ?? null,
          jobs: [
            ...(prev.jobs?.jobs ?? []),
            ...(fetchMoreResult.jobs?.jobs ?? []),
          ],
        },
      }),
    });
  };

  return {
    jobs: rows,
    totalCount: data?.jobs?.totalCount || 0,
    loading,
    error,
    refetch,
    handleFetchMore,
  };
};
