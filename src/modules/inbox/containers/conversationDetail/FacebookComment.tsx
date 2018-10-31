import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { FacebookComment } from 'modules/inbox/components/conversationDetail';
import { mutations } from 'modules/inbox/graphql';
import {
  AddMessageMutationVariables,
  IMessage,
  ReplyMutationResponse
} from 'modules/inbox/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  message: IMessage;
  scrollBottom?: () => void;
};

type FinalProps = Props & ReplyMutationResponse;

const FacebookCommentContainer = (props: FinalProps) => {
  const { replyMutation, message, scrollBottom } = props;

  const replyPost = (
    variables: AddMessageMutationVariables,
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
    replyPost,
    message,
    scrollBottom
  };

  return <FacebookComment {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ReplyMutationResponse, AddMessageMutationVariables>(
      gql(mutations.conversationMessageAdd),
      {
        name: 'replyMutation'
      }
    )
  )(FacebookCommentContainer)
);
