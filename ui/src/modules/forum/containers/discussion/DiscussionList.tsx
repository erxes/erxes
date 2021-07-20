import React from 'react';
import { generatePaginationParams } from 'modules/common/utils/router';
import { Alert, confirm } from 'modules/common/utils';

import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries, mutations } from '../../graphql';

import { DiscussionList } from '../../components/discussion';

import {
  DiscussionsQueryResponse,
  RemoveDiscussionsMutationResponse
} from '../../types';

type Props = {
  queryParams: any;
  currentTopicId: string;
  forumId: string;
};

type FinalProps = {
  discussionsQuery: DiscussionsQueryResponse;
} & Props &
  RemoveDiscussionsMutationResponse;

const DiscussionListContainer = (props: FinalProps) => {
  const { discussionsQuery, currentTopicId, removeDiscussionsMutation } = props;

  const remove = discussionId => {
    confirm().then(() => {
      removeDiscussionsMutation({
        variables: {
          _id: discussionId
        }
      })
        .then(() => {
          discussionsQuery.refetch();

          Alert.success('You successfully deleted a discussion');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    discussions: discussionsQuery.forumDiscussions || [],
    loading: discussionsQuery.loading,
    currentTopicId,
    remove
  };

  return <DiscussionList {...updatedProps} />;
};

export default compose(
  graphql<Props, DiscussionsQueryResponse, { topicId: string }>(
    gql(queries.forumDiscussions),
    {
      name: 'discussionsQuery',
      options: ({ queryParams, currentTopicId }) => ({
        variables: {
          ...generatePaginationParams(queryParams),
          topicId: String(currentTopicId)
        },
        fetchPolicy: 'network-only'
      })
    }
  ),
  graphql<Props, RemoveDiscussionsMutationResponse, { _id: string }>(
    gql(mutations.forumDiscussionsRemove),
    {
      name: 'removeDiscussionsMutation',
      options: ({ currentTopicId }) => {
        return {
          refetchQueries: [
            {
              query: gql(queries.forumDiscussionsTotalCount),
              variables: { topicId: currentTopicId }
            },
            {
              query: gql(queries.forumTopicDetail),
              variables: {
                _id: currentTopicId
              }
            }
          ]
        };
      }
    }
  )
)(DiscussionListContainer);
