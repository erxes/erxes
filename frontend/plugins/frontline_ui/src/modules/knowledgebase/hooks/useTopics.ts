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

export function useTopics(
  { searchValue }: UseTopicsProps = {}
): UseTopicsResult {
  const { data, loading, fetchMore, refetch } = useQuery(TOPICS, {
    variables: {
      page: 1,
      perPage: ITEMS_PER_PAGE,
      searchValue: searchValue || '',
    },
    notifyOnNetworkStatusChange: true,
  });

  const topics = data?.knowledgeBaseTopics?.list || [];
  const totalCount = data?.knowledgeBaseTopics?.totalCount || 0;

  const hasMore = topics.length < totalCount;

  const loadMore = async () => {
    if (!hasMore) return;

    const currentPage = Math.ceil(topics.length / ITEMS_PER_PAGE) + 1;

    await fetchMore({
      variables: {
        page: currentPage,
        perPage: ITEMS_PER_PAGE,
        searchValue: searchValue || '',
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.knowledgeBaseTopics?.list) {
          return prev;
        }

        const prevTopics = prev?.knowledgeBaseTopics?.list || [];
        const newTopics = fetchMoreResult.knowledgeBaseTopics.list;

        return {
          knowledgeBaseTopics: {
            ...fetchMoreResult.knowledgeBaseTopics,
            list: [...prevTopics, ...newTopics],
          },
        };
      },
    });
  };

  return {
    topics,
    loading,
    hasMore,
    endCursor: null,
    loadMore,
    refetch,
    totalCount,
  };
}
