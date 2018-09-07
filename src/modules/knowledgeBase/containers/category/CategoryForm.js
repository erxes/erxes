import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import gql from 'graphql-tag';
import { queries, mutations } from '../../graphql';
import { CategoryForm } from '../../components';

const KnowledgeBaseContainer = props => {
  const {
    category,
    topicIds,
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
    currentTopicId: topicIds,
    category
  };

  return <CategoryForm {...extendedProps} />;
};

KnowledgeBaseContainer.propTypes = {
  category: PropTypes.object,
  addCategoriesMutation: PropTypes.func,
  editCategoriesMutation: PropTypes.func,
  topicIds: PropTypes.string
};

const commonOptions = ({ topicIds }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.knowledgeBaseCategories),
        variables: {
          topicIds: [topicIds]
        }
      },
      {
        query: gql(queries.knowledgeBaseCategoriesTotalCount),
        variables: { topicIds: [topicIds] }
      }
    ]
  };
};

export default compose(
  graphql(gql(mutations.knowledgeBaseCategoriesEdit), {
    name: 'editCategoriesMutation',
    options: commonOptions
  }),

  graphql(gql(mutations.knowledgeBaseCategoriesAdd), {
    name: 'addCategoriesMutation',
    options: commonOptions
  })
)(KnowledgeBaseContainer);
