import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import CategoryList from '../../components/category/CategoryList';
import { mutations, queries } from '@erxes/ui-knowledgebase/src/graphql';
import {
  ArticlesTotalCountQueryResponse,
  CategoriesQueryResponse,
  CategoriesTotalCountQueryResponse,
  RemoveCategoriesMutationResponse
} from '@erxes/ui-knowledgebase/src/types';

type Props = {
  currentCategoryId: string;
  topicId: string;
  queryParams?: any;
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
    topicId,
    queryParams
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
    queryParams,
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
        variables: { categoryIds: [currentCategoryId] || [] }
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
