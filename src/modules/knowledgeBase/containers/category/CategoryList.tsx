import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CategoryList } from '../../components';
import { mutations, queries } from '../../graphql';

type Props = {
  categoriesQuery: any;
  categoriesCountQuery: any;
  articlesCountQuery: any;
  removeCategoriesMutation: (params: { variables: { _id: string } }) => any;
  currentCategoryId: string;
  topicIds: string;
};

const KnowledgeBaseContainer = (props: Props) => {
  const {
    currentCategoryId,
    categoriesQuery,
    categoriesCountQuery,
    articlesCountQuery,
    removeCategoriesMutation,
    topicIds
  } = props;

  // remove action
  const remove = _id => {
    confirm().then(() => {
      removeCategoriesMutation({
        variables: { _id }
      })
        .then(() => {
          categoriesQuery.refetch();

          Alert.success('Successfully deleted.');
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
  graphql(gql(queries.knowledgeBaseCategories), {
    name: 'categoriesQuery',
    options: ({ topicIds }: { topicIds: string[] }) => {
      return {
        variables: {
          topicIds: [topicIds]
        }
      };
    }
  }),
  graphql(gql(queries.knowledgeBaseArticlesTotalCount), {
    name: 'articlesCountQuery',
    options: ({ currentCategoryId }: { currentCategoryId: string }) => ({
      variables: { categoryIds: [currentCategoryId] || '' }
    })
  }),
  graphql(gql(queries.knowledgeBaseCategoriesTotalCount), {
    name: 'categoriesCountQuery'
  }),
  graphql(gql(mutations.knowledgeBaseCategoriesRemove), {
    name: 'removeCategoriesMutation',
    options: ({ currentCategoryId }: { currentCategoryId: string }) => {
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
  })
)(KnowledgeBaseContainer);
