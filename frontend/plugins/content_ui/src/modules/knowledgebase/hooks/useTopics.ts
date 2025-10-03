import { useQuery } from '@apollo/client';
import { TOPICS } from '../graphql/queries';
import { ITopic } from '../types';

const ITEMS_PER_PAGE = 10;

interface UseTopicsResult {
  topics: ITopic[];
  loading: boolean;
  hasMore: boolean;
  endCursor: string | null;
  loadMore: () => Promise<void>;
  refetch: () => void;
  totalCount: number;
}

export function useTopics(): UseTopicsResult {
  const { data, loading, fetchMore, refetch } = useQuery(TOPICS, {
    variables: {
      limit: ITEMS_PER_PAGE,
      cursor: null,
      direction: 'forward',
    },
  });

  const topics = data?.knowledgeBaseTopics?.list || [];
  const hasMore = data?.knowledgeBaseTopics?.pageInfo?.hasNextPage || false;
  const endCursor = data?.knowledgeBaseTopics?.pageInfo?.endCursor || null;
  const totalCount = data?.knowledgeBaseTopics?.totalCount || 0;

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
