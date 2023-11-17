import * as React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import { queries as inboxQueries } from '@erxes/ui-inbox/src/inbox/graphql';

import { mutations } from '../../graphql/index';
import {
  IInstagramComment,
  ReplyInstagramCommentMutationResponse,
  ReplyInstagRamCommentMutationVariables,
  ResolveInstagramCommentMutationVariables,
  ResolveInstagramCommentResponse
} from '../../types';
import InstagramComment from '../../components/conversationDetail/post/InstagramComment';

type Props = {
  comment: IInstagramComment;
  isReply?: boolean;

  fetchInstagram: ({
    commentId,
    postId
  }: {
    commentId?: string;
    postId?: string;
  }) => void;
};

type FinalProps = { convertToInfoQuery: any } & Props &
  ReplyInstagramCommentMutationResponse &
  ResolveInstagramCommentResponse;

const InstagramCommentContainer = (props: FinalProps) => {
  const { replyMutation, comment, convertToInfoQuery, resolveMutation } = props;

  const replyComment = (
    variables: ReplyInstagRamCommentMutationVariables,
    callback: () => void
  ) => {
    replyMutation({ variables })
      .then(() => {
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const changeStatusComment = () => {
    resolveMutation({ variables: { commentId: comment.commentId } })
      .then(() => {
        Alert.success('Success');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    replyComment,
    changeStatusComment,
    comment,
    convertToInfo: convertToInfoQuery.convertToInfo || {},
    refetch: convertToInfoQuery.refetch
  };

  return <InstagramComment {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      ReplyInstagramCommentMutationResponse,
      ReplyInstagRamCommentMutationVariables
    >(gql(mutations.instagramReplyToComment), {
      name: 'replyMutation'
    }),
    graphql<
      Props,
      ResolveInstagramCommentResponse,
      ResolveInstagramCommentMutationVariables
    >(gql(mutations.instagramChangeCommentStatus), {
      name: 'resolveMutation'
    }),
    graphql(gql(inboxQueries.convertToInfo), {
      name: 'convertToInfoQuery',
      options: ({ comment }: Props) => ({
        variables: { conversationId: comment.commentId }
      })
    })
  )(InstagramCommentContainer)
);
