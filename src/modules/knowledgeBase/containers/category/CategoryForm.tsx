import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CategoryForm } from '../../components';
import { mutations, queries } from '../../graphql';
import {
  AddCategoriesMutationResponse,
  CategoryVariables,
  EditCategoriesMutationResponse,
  ICategory
} from '../../types';

type Props = {
  category: ICategory;
  topicIds: string;
  closeModal: () => void;
};

type FinalProps = Props &
  AddCategoriesMutationResponse &
  EditCategoriesMutationResponse;

const KnowledgeBaseContainer = (props: FinalProps) => {
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
        Alert.success(
          `You successfully ${object ? 'updated' : 'added'} a category`
        );

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

export default withProps<Props>(
  compose(
    graphql<Props, EditCategoriesMutationResponse, CategoryVariables>(
      gql(mutations.knowledgeBaseCategoriesEdit),
      {
        name: 'editCategoriesMutation',
        options: commonOptions
      }
    ),

    graphql<Props, AddCategoriesMutationResponse, CategoryVariables>(
      gql(mutations.knowledgeBaseCategoriesAdd),
      {
        name: 'addCategoriesMutation',
        options: commonOptions
      }
    )
  )(KnowledgeBaseContainer)
);
