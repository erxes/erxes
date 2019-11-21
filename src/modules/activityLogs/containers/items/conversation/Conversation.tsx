import gql from 'graphql-tag';
import Conversation from 'modules/activityLogs/components/items/conversation/Conversation';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/inbox/graphql';
import {
  ConversationDetailQueryResponse,
  MessagesQueryResponse
} from 'modules/inbox/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  activity: any;
  conversationId: string;
};

type FinalProps = {
  messagesQuery: MessagesQueryResponse;
  conversationDetailQuery: ConversationDetailQueryResponse;
} & Props;

class ConversationContainer extends React.Component<FinalProps> {
  render() {
    const { conversationDetailQuery, messagesQuery } = this.props;

    if (conversationDetailQuery.loading || messagesQuery.loading) {
      return <Spinner />;
    }

    const conversation = conversationDetailQuery.conversationDetail;
    const messages = messagesQuery.conversationMessages;

    const updatedProps = {
      ...this.props,
      conversation,
      messages
    };

    return <Conversation {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConversationDetailQueryResponse>(
      gql(queries.conversationDetail),
      {
        name: 'conversationDetailQuery',
        options: ({ conversationId }) => ({
          variables: {
            _id: conversationId
          }
        })
      }
    ),
    graphql<Props, MessagesQueryResponse>(gql(queries.conversationMessages), {
      name: 'messagesQuery',
      options: ({ conversationId }) => ({
        variables: {
          conversationId,
          limit: 20
        }
      })
    })
  )(ConversationContainer)
);
