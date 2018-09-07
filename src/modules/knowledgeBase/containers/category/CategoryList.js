import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Alert, confirm } from 'modules/common/utils';
import gql from 'graphql-tag';
import { queries, mutations } from '../../graphql';
import { CategoryList } from '../../components';

const KnowledgeBaseContainer = props => {
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
    ...this.props,
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

KnowledgeBaseContainer.propTypes = {
  categoriesQuery: PropTypes.object,
  categoriesCountQuery: PropTypes.object,
  articlesCountQuery: PropTypes.object,
  removeCategoriesMutation: PropTypes.func,
  currentCategoryId: PropTypes.string,
  topicIds: PropTypes.string
};

export default compose(
  graphql(gql(queries.knowledgeBaseCategories), {
    name: 'categoriesQuery',
    options: ({ topicIds }) => {
      return {
        variables: {
          topicIds: [topicIds]
        }
      };
    }
  }),
  graphql(gql(queries.knowledgeBaseArticlesTotalCount), {
    name: 'articlesCountQuery',
    options: ({ currentCategoryId }) => ({
      variables: { categoryIds: [currentCategoryId] || '' }
    })
  }),
  graphql(gql(queries.knowledgeBaseCategoriesTotalCount), {
    name: 'categoriesCountQuery'
  }),
  graphql(gql(mutations.knowledgeBaseCategoriesRemove), {
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
  })
)(KnowledgeBaseContainer);
