import { useQuery } from '@apollo/client';
import { TOPICS } from '../graphql/queries';
import { ITopic } from '../types';

const ITEMS_PER_PAGE = 10;

interface UseTopicsProps {
  searchValue?: string;
}

interface UseTopicsResult {
  topics: ITopic[];
  loading: boolean;
  hasMore: boolean;
  endCursor: string | null;
  loadMore: () => Promise<void>;
  refetch: () => void;
  totalCount: number;
}

export function useTopics({ searchValue }: UseTopicsProps = {}): UseTopicsResult {
  const { data, loading, fetchMore, refetch } = useQuery(TOPICS, {
    variables: {
      page: 1,
      perPage: ITEMS_PER_PAGE,
      searchValue: searchValue || '',
    },
  });

  const topics = data?.knowledgeBaseTopics || [];
  const hasMore = false;
  const endCursor = null;
  const totalCount = topics.length;

  const loadMore = async () => {
    if (!endCursor) return;

    try {
      await fetchMore({
        variables: {
          limit: ITEMS_PER_PAGE,
          cursor: endCursor,
          direction: 'forward',
        },
      });
    } catch (error) {
      console.error('Error loading more topics:', error);
    }
  };

  return {
    topics,
    loading,
    hasMore,
    endCursor,
    loadMore,
    refetch,
    totalCount,
  };
}
