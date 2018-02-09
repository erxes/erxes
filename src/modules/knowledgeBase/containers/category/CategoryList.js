import React from 'react';
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
    removeCategoriesMutation
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
    categories: categoriesQuery.knowledgeBaseCategories || [],
    loading: categoriesQuery.loading,
    topicsCount: categoriesCountQuery.knowledgeBaseCategoriesTotalCount || 0
  };

  return <CategoryList {...extendedProps} />;
};

KnowledgeBaseContainer.propTypes = {
  categoriesQuery: PropTypes.object,
  categoriesCountQuery: PropTypes.object,
  removeCategoriesMutation: PropTypes.func,
  currentCategoryId: PropTypes.string,
  currentTopicId: PropTypes.string
};

export default compose(
  graphql(gql(queries.knowledgeBaseCategories), {
    name: 'categoriesQuery',
    options: ({ queryParams, currentTopicId }) => ({
      variables: {
        topicIds: [currentTopicId],
        page: queryParams.page,
        perPage: queryParams.perPage || 20
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.knowledgeBaseCategoriesTotalCount), {
    name: 'categoriesCountQuery'
  }),
  graphql(gql(mutations.knowledgeBaseCategoriesRemove), {
    name: 'removeCategoriesMutation'
  })
)(KnowledgeBaseContainer);
