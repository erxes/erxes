import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import CategoryForm from '../../components/category/CategoryForm';
import { mutations, queries } from '../../graphql';
import { ICategory } from '../../types';

type Props = {
  category: ICategory;
  topicIds: string;
  closeModal: () => void;
  refetchTopics: () => void;
};

const KnowledgeBaseContainer = (props: Props) => {
  const { category, topicIds } = props;

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
        refetchQueries={getRefetchQueries(topicIds)}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const extendedProps = {
    ...props,
    renderButton,
    currentTopicId: topicIds,
    category
  };

  return <CategoryForm {...extendedProps} />;
};

const getRefetchQueries = (topicIds: string) => {
  return [
    {
      query: gql(queries.knowledgeBaseCategories),
      variables: {
        topicIds: [topicIds]
      }
    },
    {
      query: gql(queries.knowledgeBaseCategoriesTotalCount),
      variables: { topicIds: [topicIds] }
    },
    { query: gql(queries.knowledgeBaseTopics) }
  ];
};

export default KnowledgeBaseContainer;
