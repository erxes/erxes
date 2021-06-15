import React from 'react';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { DiscussionForm } from '../../components/discussion';
import { mutations, queries } from '../../graphql';
import { generatePaginationParams } from 'modules/common/utils/router';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { TagsQueryResponse } from '../../../tags/types';
import { queries as tagQueries } from 'modules/tags/graphql';
import { TAG_TYPES } from 'modules/tags/constants';
import { graphql } from 'react-apollo';

import { IDiscussion } from '../../types';

type Props = {
  queryParams: any;
  currentTopicId: string;
  closeModal: () => void;
  discussion: IDiscussion;
  forumId: string;
  tagsQuery: TagsQueryResponse;
};

const DiscussionFormContainer = (props: Props) => {
  const {
    closeModal,
    currentTopicId,
    discussion,
    queryParams,
    forumId,
    tagsQuery
  } = props;

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
        refetchQueries={getRefetchQueries(queryParams, currentTopicId, forumId)}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={` You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const tags = tagsQuery.tags || [];

  const updatedProps = {
    ...props,
    renderButton,
    closeModal,
    discussion,
    currentTopicId,
    forumId,
    tags
  };

  return <DiscussionForm {...updatedProps} />;
};

const getRefetchQueries = (
  queryParams,
  currentTopicId: string,
  forumId: string
) => {
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
      query: gql(queries.forumTopics),
      variables: {
        forumId
      }
    }
  ];
};

export default compose(
  graphql<{}, TagsQueryResponse, { type: string }>(gql(tagQueries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.FORUM
      }
    })
  })
)(DiscussionFormContainer);
