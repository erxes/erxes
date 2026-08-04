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
  scheduledDate?: string;
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
      categoryIds,
    },
  });

  const articles = data?.knowledgeBaseArticles || [];
  const hasMore = false; // No pagination for now
  const endCursor = null;
  const totalCount = articles.length;

  const loadMore = async () => {
    // No pagination implemented
    return;
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
