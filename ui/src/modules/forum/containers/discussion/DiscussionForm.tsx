import React from 'react';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { DiscussionForm } from '../../components/discussion';
import { mutations, queries } from '../../graphql';
import { generatePaginationParams } from 'modules/common/utils/router';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';

import { IDiscussion } from '../../types';

type Props = {
  queryParams: any;
  currentTopicId: string;
  closeModal: () => void;
  discussion: IDiscussion;
};

const DiscussionFormContainer = (props: Props) => {
  const { closeModal, currentTopicId, discussion, queryParams } = props;

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
            ? mutations.forumDiscussionsEdit
            : mutations.forumDiscussionsAdd
        }
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(queryParams, currentTopicId)}
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
    discussion,
    currentTopicId
  };

  return <DiscussionForm {...updatedProps} />;
};

const getRefetchQueries = (queryParams, currentTopicId: string) => {
  return [
    {
      query: gql(queries.forumDiscussions),
      variables: {
        ...generatePaginationParams(queryParams),
        topicId: currentTopicId
      }
    },
    {
      query: gql(queries.forumDiscussionsTotalCount),
      variables: {
        topicId: currentTopicId
      }
    },
    {
      query: gql(queries.forumTopics)
    }
  ];
};

export default compose()(DiscussionFormContainer);
