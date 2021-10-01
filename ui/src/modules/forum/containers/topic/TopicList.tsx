import React from 'react';
import TopicList from '../../components/topic/TopicList';

import * as compose from 'lodash.flowright';
import { Alert, confirm } from 'modules/common/utils';

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import { IForum, RemoveTopicsMutationResponse } from '../../types';

type Props = {
  forumId: string;
  currentTopicId: string;
  forum: IForum;
};

type FinalProps = {} & Props & RemoveTopicsMutationResponse;

const TopicListContainer = (props: FinalProps) => {
  const { removeTopicsMutation } = props;

  const remove = topicId => {
    confirm().then(() => {
      removeTopicsMutation({
        variables: {
          _id: topicId
        }
      })
        .then(() => {
          Alert.success('You successfully deleted a topic');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    remove
  };

  return <TopicList {...updatedProps} />;
};

export default compose(
  graphql<Props, RemoveTopicsMutationResponse, { _id: string }>(
    gql(mutations.forumTopicsRemove),
    {
      name: 'removeTopicsMutation',
      options: ({ currentTopicId, forumId }) => ({
        refetchQueries: [
          {
            query: gql(queries.forumDetail),
            variables: { _id: forumId }
          },
          {
            query: gql(queries.forumTopicDetail),
            variables: { _id: currentTopicId }
          },
          {
            query: gql(queries.forumDiscussionsTotalCount),
            variables: { topicId: currentTopicId }
          }
        ]
      })
    }
  )
)(TopicListContainer);
