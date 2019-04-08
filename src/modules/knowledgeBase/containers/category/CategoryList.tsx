import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CategoryList } from '../../components';
import { mutations, queries } from '../../graphql';
import {
  ArticlesTotalCountQueryResponse,
  CategoriesQueryResponse,
  CategoriesTotalCountQueryResponse,
  RemoveCategoriesMutationResponse
} from '../../types';

type Props = {
  currentCategoryId: string;
  topicIds: string;
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
    topicIds
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
    topicIds,
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
      options: ({ topicIds }) => {
        return {
          variables: {
            topicIds: [topicIds]
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
        return {
          refetchQueries: [
            {
              query: gql(queries.knowledgeBaseArticlesTotalCount),
              variables: { categoryIds: [currentCategoryId] }
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
)(KnowledgeBaseContainer);
