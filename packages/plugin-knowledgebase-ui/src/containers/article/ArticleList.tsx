import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import ArticleList from '../../components/article/ArticleList';
import { mutations, queries } from '@erxes/ui-knowledgebase/src/graphql';
import {
  ArticlesQueryResponse,
  RemoveArticlesMutationResponse,
} from '@erxes/ui-knowledgebase/src/types';

type Props = {
  queryParams: any;
  currentCategoryId: string;
  topicId: string;
};

const ArticleContainer = (props: Props) => {
  const { queryParams, currentCategoryId, topicId } = props;

  const articlesQuery = useQuery<ArticlesQueryResponse>(
    gql(queries.knowledgeBaseArticles),
    {
      variables: {
        ...generatePaginationParams(queryParams),
        categoryIds: [currentCategoryId],
      },
      fetchPolicy: 'network-only',
    },
  );

  const [removeArticlesMutation] = useMutation<RemoveArticlesMutationResponse>(
    gql(mutations.knowledgeBaseArticlesRemove),
    {
      refetchQueries: refetchQueries(currentCategoryId, topicId),
    },
  );

  // remove action
  const remove = (articleId) => {
    confirm().then(() => {
      removeArticlesMutation({
        variables: { _id: articleId },
      })
        .then(() => {
          articlesQuery.refetch();

          Alert.success('You successfully deleted an article');
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const extendedProps = {
    ...props,
    remove,
    currentCategoryId,
    topicId,
    queryParams,
    articles: articlesQuery?.data?.knowledgeBaseArticles || [],
    loading: articlesQuery.loading,
  };

  return <ArticleList {...extendedProps} />;
};

const refetchQueries = (currentCategoryId: string, topicId: string) => {
  return [
    {
      query: gql(queries.knowledgeBaseArticlesTotalCount),
      variables: { categoryIds: [currentCategoryId] },
    },
    {
      query: gql(queries.knowledgeBaseCategories),
      variables: { topicIds: [topicId] },
    },
    {
      query: gql(queries.knowledgeBaseCategoryDetail),
      variables: { _id: currentCategoryId },
    },
  ];
};

export default ArticleContainer;
