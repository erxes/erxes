import React from 'react';
import { TopicForm } from '../../components/topic';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { graphql } from 'react-apollo';

import { mutations, queries } from '../../graphql';

const TopicFormContainer = props => {
  const { forumTopicsQuery, closeModal } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      forumTopicsQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.forumTopicsEdit : mutations.forumTopicsAdd}
        variables={values}
        callback={callBackResponse}
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
    closeModal
  };

  return <TopicForm {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.forumTopics), {
    name: 'forumTopicsQuery'
  })
)(TopicFormContainer);
