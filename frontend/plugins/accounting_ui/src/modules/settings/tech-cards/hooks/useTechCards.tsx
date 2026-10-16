import { useQuery } from '@apollo/client';
import { GET_TECH_CARDS } from '../graphql/techCardQueries';
import { ITechCard } from '../types/TechCard';
import { useTechCardFilters } from './useTechCardFilters';

const TECH_CARD_PER_PAGE = 20;

export const useTechCards = () => {
  const filters = useTechCardFilters();
  const { data, loading, fetchMore, error, refetch } = useQuery<{
    techCards: { techCards: ITechCard[]; totalCount: number };
  }>(GET_TECH_CARDS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      ...filters,
      page: 1,
      perPage: TECH_CARD_PER_PAGE,
      sortField: 'modifiedAt',
      sortDirection: -1,
    },
  });

  const rows = data?.techCards?.techCards || [];

  const handleFetchMore = () => {
    if (
      loading ||
      !rows.length ||
      rows.length >= (data?.techCards?.totalCount ?? 0)
    ) {
      return;
    }

    fetchMore({
      variables: {
        page: Math.ceil(rows.length / TECH_CARD_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => ({
        techCards: {
          ...prev.techCards,
          techCards: [
            ...prev.techCards.techCards,
            ...fetchMoreResult.techCards.techCards,
          ],
        },
      }),
    });
  };

  return {
    techCards: rows,
    totalCount: data?.techCards?.totalCount || 0,
    loading,
    error,
    refetch,
    handleFetchMore,
  };
};
