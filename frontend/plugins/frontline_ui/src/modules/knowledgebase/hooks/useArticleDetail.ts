import { useQuery } from '@apollo/client';
import { ARTICLE_DETAIL } from '../graphql/queries';
import type { IKnowledgeBaseArticle } from '../types';

interface UseArticleDetailResult {
  article?: IKnowledgeBaseArticle;
  loading: boolean;
  refetch: () => void;
}

export function useArticleDetail(
  articleId?: string | null,
): UseArticleDetailResult {
  const { data, loading, refetch } = useQuery<{
    knowledgeBaseArticleDetail: IKnowledgeBaseArticle;
  }>(ARTICLE_DETAIL, {
    variables: { _id: articleId },
    skip: !articleId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    article: data?.knowledgeBaseArticleDetail,
    loading,
    refetch,
  };
}
