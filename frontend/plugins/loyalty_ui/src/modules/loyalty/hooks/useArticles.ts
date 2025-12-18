import { useQuery } from '@apollo/client';
import { ARTICLES } from '../graphql/queries';

const ITEMS_PER_PAGE = 20;

export interface Article {
  _id: string;
  title: string;
  code: string;
  summary: string;
  content: string;
  status: string;
  categoryId: string;
  createdDate: string;
  createdUser: {
    _id: string;
    username: string;
    email: string;
  };
  publishedUser: {
    _id: string;
    username: string;
    email: string;
    details: {
      avatar: string;
      fullName: string;
    };
  };
  createdBy: string;
  modifiedBy: string;
}

interface UseArticlesProps {
  categoryIds?: string[];
}

interface UseArticlesResult {
  articles: Article[];
  loading: boolean;
  hasMore: boolean;
  endCursor: string | null;
  loadMore: () => Promise<void>;
  refetch: () => void;
  totalCount: number;
}

export function useArticles({
  categoryIds,
}: UseArticlesProps = {}): UseArticlesResult {
  const { data, loading, fetchMore, refetch } = useQuery(ARTICLES, {
    variables: {
      limit: ITEMS_PER_PAGE,
      cursor: null,
      direction: 'forward',
      categoryIds,
    },
  });

  const articles = data?.knowledgeBaseArticles?.list || [];
  const hasMore = data?.knowledgeBaseArticles?.pageInfo?.hasNextPage || false;
  const endCursor = data?.knowledgeBaseArticles?.pageInfo?.endCursor || null;
  const totalCount = data?.knowledgeBaseArticles?.totalCount || 0;

  const loadMore = async () => {
    if (!endCursor) return;

    try {
      await fetchMore({
        variables: {
          limit: ITEMS_PER_PAGE,
          cursor: endCursor,
          direction: 'forward',
          categoryIds,
        },
      });
    } catch (error) {
      console.error('Error loading more articles:', error);
    }
  };

  return {
    articles,
    loading,
    hasMore,
    endCursor,
    loadMore,
    refetch,
    totalCount,
  };
}
