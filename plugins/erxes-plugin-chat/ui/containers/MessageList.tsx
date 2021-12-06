import React from 'react';
import { useQuery, useSubscription } from 'react-apollo';
import gql from 'graphql-tag';
import Spinner from 'erxes-ui/lib/components/Spinner';

import MessageList from '../components/MessageList';
import { queries, subscriptions } from '../graphql';

export default function MessageListContainer({ chatId, userIds }) {
  const chatMessagesQuery = useQuery(gql(queries.chatMessages), {
    variables: {
      chatId,
      userIds
    }
  });

  const chatMessageSubscription = useSubscription(
    gql(subscriptions.chatMessageInserted),
    {
      variables: {
        chatId
      }
    }
  );

  if (chatMessageSubscription.data) {
    chatMessagesQuery.refetch({ chatId, userIds });
  }

  if (chatMessagesQuery.loading) {
    return <Spinner />;
  }

  if (chatMessagesQuery.error) {
    return <div>{chatMessagesQuery.error.message}</div>;
  }

  return <MessageList messages={chatMessagesQuery.data.chatMessages.list} />;
}
