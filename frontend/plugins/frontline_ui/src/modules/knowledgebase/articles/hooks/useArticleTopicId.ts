import { useQuery } from '@apollo/client';
import { CATEGORY_DETAIL } from '@/knowledgebase/graphql/queries';

export const useArticleTopicId = (article?: {
  topicId?: string | null;
  categoryId?: string | null;
}) => {
  const { data, loading, error } = useQuery(CATEGORY_DETAIL, {
    variables: { _id: article?.categoryId || '' },
    skip: !article?.categoryId || Boolean(article.topicId),
  });
  const topicId =
    article?.topicId ||
    data?.knowledgeBaseCategoryDetail?.firstTopic?._id ||
    '';

  return { topicId, loading, error };
};
