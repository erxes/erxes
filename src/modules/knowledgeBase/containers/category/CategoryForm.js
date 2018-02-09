import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import gql from 'graphql-tag';
import { queries, mutations } from '../../graphql';
import { CategoryForm } from '../../components';

const KnowledgeBaseContainer = props => {
  const {
    category,
    currentCategoryId,
    currentTopicId,
    categoriesQuery,
    addCategoriesMutation,
    editCategoriesMutation
  } = props;

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

        Alert.success('Congrats');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...this.props,
    save,
    currentCategoryId,
    currentTopicId,
    category,
    loading: categoriesQuery.loading
  };

  return <CategoryForm {...extendedProps} />;
};

KnowledgeBaseContainer.propTypes = {
  category: PropTypes.object,
  categoriesQuery: PropTypes.object,
  addCategoriesMutation: PropTypes.func,
  editCategoriesMutation: PropTypes.func,
  currentCategoryId: PropTypes.string,
  currentTopicId: PropTypes.string
};

export default compose(
  graphql(gql(queries.knowledgeBaseCategories), {
    name: 'categoriesQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.knowledgeBaseCategoriesEdit), {
    name: 'editCategoriesMutation'
  }),
  graphql(gql(mutations.knowledgeBaseCategoriesAdd), {
    name: 'addCategoriesMutation'
  })
)(KnowledgeBaseContainer);
