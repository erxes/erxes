import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { FacebookComment } from 'modules/inbox/components/conversationDetail';
import { mutations } from 'modules/inbox/graphql';
import { IMessage } from 'modules/inbox/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IAddMessage } from './WorkArea';

type Props = {
  replyMutation: (
    doc: {
      variables: IAddMessage;
    }
  ) => Promise<any>;
  message: IMessage;
  scrollBottom: () => void;
};

const FacebookCommentContainer = (props: Props) => {
  const { replyMutation, message, scrollBottom } = props;

  const replyPost = (variables: IAddMessage, callback: () => void) => {
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

export default compose(
  graphql(gql(mutations.conversationMessageAdd), {
    name: 'replyMutation'
  })
)(FacebookCommentContainer);
