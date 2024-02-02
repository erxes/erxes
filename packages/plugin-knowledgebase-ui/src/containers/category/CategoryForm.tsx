import { gql, useQuery } from '@apollo/client';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import CategoryForm from '../../components/category/CategoryForm';
import { mutations, queries } from '@erxes/ui-knowledgebase/src/graphql';
import {
  ICategory,
  TopicsQueryResponse,
} from '@erxes/ui-knowledgebase/src/types';

type Props = {
  category: ICategory;
  topicId: string;
  closeModal: () => void;
  refetchTopics: () => void;
  queryParams: any;
};

const KnowledgeBaseContainer = (props: Props) => {
  const { category, topicId, closeModal, queryParams } = props;

  const topicsQuery = useQuery<TopicsQueryResponse>(
    gql(queries.knowledgeBaseTopics),
    {
      fetchPolicy: 'network-only',
    },
  );

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
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
    queryParams,
    topics: topicsQuery?.data?.knowledgeBaseTopics || [],
  };

  return <CategoryForm {...extendedProps} />;
};

const getRefetchQueries = (topicIds: string[]) => {
  return [
    {
      query: gql(queries.knowledgeBaseCategories),
      variables: {
        topicIds,
      },
    },
    {
      query: gql(queries.knowledgeBaseCategoriesTotalCount),
      variables: { topicIds },
    },
    { query: gql(queries.knowledgeBaseTopics) },
  ];
};

export default KnowledgeBaseContainer;
