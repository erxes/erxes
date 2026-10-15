import { DocumentNode, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { articlesQueryVariables } from '@/knowledgebase/articles/hooks/useArticles';
import { categoriesQueryVariables } from '@/knowledgebase/categories/hooks/useCategories';
import {
  ARTICLES,
  CATEGORIES,
  TOPIC_DETAIL,
} from '@/knowledgebase/graphql/queries';

export const usePrefetchTopic = () => {
  const client = useApolloClient();

  return useCallback(
    (topicId: string) => {
      const prefetch = (query: DocumentNode, variables: object) =>
        client.query({ query, variables }).catch(() => undefined);

      prefetch(ARTICLES, articlesQueryVariables(topicId));
      prefetch(CATEGORIES, categoriesQueryVariables(topicId));
      prefetch(TOPIC_DETAIL, { _id: topicId });
    },
    [client],
  );
};
