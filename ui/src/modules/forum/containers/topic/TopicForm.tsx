import React from 'react';
import { TopicForm } from '../../components/topic';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';

import { mutations, queries } from '../../graphql';
import { ITopic } from '../../types';

type Props = {
  closeModal: () => void;
  forumId: string;
  topic: ITopic;
};

const TopicFormContainer = (props: Props) => {
  const { closeModal, topic, forumId } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.forumTopicsEdit : mutations.forumTopicsAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={` You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
    closeModal,
    topic,
    forumId
  };

  return <TopicForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.forumTopics)
    },
    { query: gql(queries.forums) }
  ];
};

export default compose()(TopicFormContainer);
