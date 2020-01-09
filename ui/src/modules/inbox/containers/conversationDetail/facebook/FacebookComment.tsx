import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import FacebookComment from 'modules/inbox/components/conversationDetail/workarea/facebook/FacebookComment';
import { mutations } from 'modules/inbox/graphql';
import {
  IFacebookComment,
  ReplyFacebookCommentMutationResponse,
  ReplyFaceBookCommentMutationVariables
} from 'modules/inbox/types';
import * as React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  comment: IFacebookComment;
  isReply?: boolean;

  fetchFacebook: (
    { commentId, postId }: { commentId?: string; postId?: string }
  ) => void;
};

type FinalProps = Props & ReplyFacebookCommentMutationResponse;

const FacebookCommentContainer = (props: FinalProps) => {
  const { replyMutation, comment } = props;

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

  const updatedProps = {
    ...props,
    replyComment,
    comment
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
    })
  )(FacebookCommentContainer)
);
