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
    removeCategoriesMutation,
    addCategoriesMutation,
    editCategoriesMutation
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

  // create or update action
  const save = ({ doc }, callback, object) => {
    let mutation = addCategoriesMutation;

    // if edit mode
    if (object) {
      mutation = editCategoriesMutation;
      doc._id = object._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        // update queries
        categoriesQuery.refetch();
        categoriesCountQuery.refetch();

        Alert.success('Congrats');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...this.props,
    remove,
    save,
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
  addCategoriesMutation: PropTypes.func,
  editCategoriesMutation: PropTypes.func,
  removeCategoriesMutation: PropTypes.func,
  currentCategoryId: PropTypes.string
};

export default compose(
  graphql(gql(queries.knowledgeBaseCategories), {
    name: 'categoriesQuery',
    options: ({ queryParams, currentTopicId }) => ({
      variables: {
        topicId: currentTopicId,
        page: queryParams.page,
        perPage: queryParams.perPage || 20
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.knowledgeBaseCategoriesTotalCount), {
    name: 'categoriesCountQuery'
  }),
  graphql(gql(mutations.knowledgeBaseCategoriesEdit), {
    name: 'editCategoriesMutation'
  }),
  graphql(gql(mutations.knowledgeBaseCategoriesAdd), {
    name: 'addCategoriesMutation'
  }),
  graphql(gql(mutations.knowledgeBaseCategoriesRemove), {
    name: 'removeCategoriesMutation'
  })
)(KnowledgeBaseContainer);
