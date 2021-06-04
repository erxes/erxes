import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import { graphql } from 'react-apollo';
import CategoryForm from '../../components/category/CategoryForm';
import { mutations, queries } from '../../graphql';
import { ICategory, TopicsQueryResponse } from '../../types';

type Props = {
  category: ICategory;
  topicId: string;
  closeModal: () => void;
  refetchTopics: () => void;
};

type FinalProps = {
  topicsQuery: TopicsQueryResponse;
} & Props;

const KnowledgeBaseContainer = (props: FinalProps) => {
  const { category, topicId, topicsQuery, closeModal } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={
          object
            ? mutations.knowledgeBaseCategoriesEdit
            : mutations.knowledgeBaseCategoriesAdd
        }
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries([topicId])}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const extendedProps = {
    closeModal,
    renderButton,
    currentTopicId: topicId,
    category,
    topics: topicsQuery.knowledgeBaseTopics || []
  };

  return <CategoryForm {...extendedProps} />;
};

const getRefetchQueries = (topicIds: string[]) => {
  return [
    {
      query: gql(queries.knowledgeBaseCategories),
      variables: {
        topicIds
      }
    },
    {
      query: gql(queries.knowledgeBaseCategoriesTotalCount),
      variables: { topicIds }
    },
    { query: gql(queries.knowledgeBaseTopics) }
  ];
};

export default compose(
  graphql<Props, TopicsQueryResponse>(gql(queries.knowledgeBaseTopics), {
    name: 'topicsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(KnowledgeBaseContainer);
