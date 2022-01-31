import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import ArticleList from '../../components/article/ArticleList';
import { mutations, queries } from '../../graphql';
import {
  ArticlesQueryResponse,
  RemoveArticlesMutationResponse
} from '../../types';

type Props = {
  queryParams: any;
  currentCategoryId: string;
  topicId: string;
};

type FinalProps = { articlesQuery: ArticlesQueryResponse } & Props &
  RemoveArticlesMutationResponse;

const ArticleContainer = (props: FinalProps) => {
  const {
    articlesQuery,
    removeArticlesMutation,
    queryParams,
    currentCategoryId,
    topicId
  } = props;

  // remove action
  const remove = articleId => {
    confirm().then(() => {
      removeArticlesMutation({
        variables: { _id: articleId }
      })
        .then(() => {
          articlesQuery.refetch();

          Alert.success('You successfully deleted an article');
        })
        .catch(error => {
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
    articles: articlesQuery.knowledgeBaseArticles || [],
    loading: articlesQuery.loading
  };

  return <ArticleList {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      ArticlesQueryResponse,
      { categoryIds: string[]; page: number; perPage: number }
    >(gql(queries.knowledgeBaseArticles), {
      name: 'articlesQuery',
      options: ({ queryParams, currentCategoryId }) => ({
        variables: {
          ...generatePaginationParams(queryParams),
          categoryIds: [currentCategoryId]
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, RemoveArticlesMutationResponse, { _id: string }>(
      gql(mutations.knowledgeBaseArticlesRemove),
      {
        name: 'removeArticlesMutation',
        options: ({ currentCategoryId, topicId }) => {
          return {
            refetchQueries: [
              {
                query: gql(queries.knowledgeBaseArticlesTotalCount),
                variables: { categoryIds: [currentCategoryId] }
              },
              {
                query: gql(queries.knowledgeBaseCategories),
                variables: { topicIds: [topicId] }
              },
              {
                query: gql(queries.knowledgeBaseCategoryDetail),
                variables: { _id: currentCategoryId }
              }
            ]
          };
        }
      }
    )
  )(ArticleContainer)
);
