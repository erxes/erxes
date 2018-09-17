import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CategoryForm } from '../../components';
import { mutations, queries } from '../../graphql';
import { ICategory } from '../../types';

type Props = {
  category: ICategory,
  addCategoriesMutation: (params: { variables: any }) => any,
  editCategoriesMutation: (params: { variables: any }) => any,
  topicIds: string
};

const KnowledgeBaseContainer = (props: Props) => {
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
    ...props,
    save,
    currentTopicId: topicIds,
    category
  };

  return <CategoryForm {...extendedProps} />;
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
