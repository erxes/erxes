import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import CategoryList from '../../components/category/CategoryList';
import { mutations, queries } from '../../graphql';
import {
  ArticlesTotalCountQueryResponse,
  CategoriesQueryResponse,
  CategoriesTotalCountQueryResponse,
  RemoveCategoriesMutationResponse
} from '../../types';

type Props = {
  currentCategoryId: string;
  topicId: string;
};

type FinalProps = {
  categoriesQuery: CategoriesQueryResponse;
  categoriesCountQuery: CategoriesTotalCountQueryResponse;
  articlesCountQuery: ArticlesTotalCountQueryResponse;
} & Props &
  RemoveCategoriesMutationResponse;

const KnowledgeBaseContainer = (props: FinalProps) => {
  const {
    currentCategoryId,
    categoriesQuery,
    categoriesCountQuery,
    articlesCountQuery,
    removeCategoriesMutation,
    topicId
  } = props;

  // remove action
  const remove = categoryId => {
    confirm().then(() => {
      removeCategoriesMutation({
        variables: { _id: categoryId }
      })
        .then(() => {
          categoriesQuery.refetch();

          Alert.success('You successfully deleted a category');
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
    categoriesQuery,
    categories: categoriesQuery.knowledgeBaseCategories || [],
    loading: categoriesQuery.loading,
    topicsCount: categoriesCountQuery.knowledgeBaseCategoriesTotalCount || 0,
    articlesCount: articlesCountQuery.knowledgeBaseArticlesTotalCount || 0
  };

  return <CategoryList {...extendedProps} />;
};

export default compose(
  graphql<Props, CategoriesQueryResponse, { topicIds: string[] }>(
    gql(queries.knowledgeBaseCategories),
    {
      name: 'categoriesQuery',
      options: ({ topicId }) => {
        return {
          variables: {
            topicIds: [topicId]
          }
        };
      }
    }
  ),
  graphql<Props, ArticlesTotalCountQueryResponse, { categoryIds: string[] }>(
    gql(queries.knowledgeBaseArticlesTotalCount),
    {
      name: 'articlesCountQuery',
      options: ({ currentCategoryId }) => ({
        variables: { categoryIds: [currentCategoryId] || '' }
      })
    }
  ),
  graphql<Props, CategoriesTotalCountQueryResponse>(
    gql(queries.knowledgeBaseCategoriesTotalCount),
    {
      name: 'categoriesCountQuery'
    }
  ),
  graphql<Props, RemoveCategoriesMutationResponse, { _id: string }>(
    gql(mutations.knowledgeBaseCategoriesRemove),
    {
      name: 'removeCategoriesMutation',
      options: ({ currentCategoryId }) => {
        const refetchQueries: any[] = [
          {
            query: gql(queries.knowledgeBaseCategories)
          },
          {
            query: gql(queries.knowledgeBaseTopics)
          }
        ];

        if (currentCategoryId) {
          refetchQueries.push({
            query: gql(queries.knowledgeBaseArticlesTotalCount),
            variables: { categoryIds: [currentCategoryId] }
          });

          refetchQueries.push({
            query: gql(queries.knowledgeBaseCategoryDetail),
            variables: { _id: currentCategoryId },
            skip: () => !currentCategoryId
          });
        }

        return {
          refetchQueries
        };
      }
    }
  )
)(KnowledgeBaseContainer);
