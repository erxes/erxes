import * as React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import { queries as inboxQueries } from '@erxes/ui-inbox/src/inbox/graphql';

import { mutations } from '../../graphql/index';
import {
  IFacebookComment,
  ReplyFacebookCommentMutationResponse,
  ReplyFaceBookCommentMutationVariables,
  ResolveFacebookCommentMutationVariables,
  ResolveFacebookCommentResponse
} from '../../types';
import FacebookComment from '../../components/conversationDetail/post/FacebookComment';

type Props = {
  comment: IFacebookComment;
  isReply?: boolean;

  fetchFacebook: ({
    commentId,
    postId
  }: {
    commentId?: string;
    postId?: string;
  }) => void;
};

type FinalProps = { convertToInfoQuery: any } & Props &
  ReplyFacebookCommentMutationResponse &
  ResolveFacebookCommentResponse;

const FacebookCommentContainer = (props: FinalProps) => {
  const { replyMutation, comment, convertToInfoQuery, resolveMutation } = props;

  const replyComment = (
    variables: ReplyFaceBookCommentMutationVariables,
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

  return <FacebookComment {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      ReplyFacebookCommentMutationResponse,
      ReplyFaceBookCommentMutationVariables
    >(gql(mutations.facebookReplyToComment), {
      name: 'replyMutation'
    }),
    graphql<
      Props,
      ResolveFacebookCommentResponse,
      ResolveFacebookCommentMutationVariables
    >(gql(mutations.facebookChangeCommentStatus), {
      name: 'resolveMutation'
    }),
    graphql(gql(inboxQueries.convertToInfo), {
      name: 'convertToInfoQuery',
      options: ({ comment }: Props) => ({
        variables: { conversationId: comment.commentId }
      })
    })
  )(FacebookCommentContainer)
);
