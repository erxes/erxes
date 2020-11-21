import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import FacebookComment from 'modules/inbox/components/conversationDetail/workarea/facebook/FacebookComment';
import { mutations } from 'modules/inbox/graphql';
import { queries } from 'modules/inbox/graphql';
import {
  IFacebookComment,
  ReplyFacebookCommentMutationResponse,
  ReplyFaceBookCommentMutationVariables,
  ResolveFacebookCommentMutationVariables,
  ResolveFacebookCommentResponse
} from 'modules/inbox/types';
import * as React from 'react';
import { graphql } from 'react-apollo';

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
    >(gql(mutations.conversationsReplyFacebookComment), {
      name: 'replyMutation'
    }),
    graphql<
      Props,
      ResolveFacebookCommentResponse,
      ResolveFacebookCommentMutationVariables
    >(gql(mutations.conversationsChangeStatusFacebookComment), {
      name: 'resolveMutation'
    }),
    graphql(gql(queries.convertToInfo), {
      name: 'convertToInfoQuery',
      options: ({ comment }: Props) => ({
        variables: { conversationId: comment.commentId }
      })
    })
  )(FacebookCommentContainer)
);
