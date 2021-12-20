import React from 'react';
import { useQuery, useSubscription } from 'react-apollo';
import gql from 'graphql-tag';
import Spinner from 'erxes-ui/lib/components/Spinner';

import MessageList from '../components/MessageList';
import { queries, subscriptions } from '../graphql';

function MessageListContainer({ chatId }) {
  const chatMessagesQuery = useQuery(gql(queries.chatMessages), {
    variables: {
      chatId
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
    chatMessagesQuery.refetch({ chatId });
  }

  if (chatMessagesQuery.loading) {
    return <Spinner />;
  }

  if (chatMessagesQuery.error) {
    return <div>{chatMessagesQuery.error.message}</div>;
  }

  return <MessageList messages={chatMessagesQuery.data.chatMessages.list} />;
}

function GetChatId({ userIds }) {
  const { loading, data, error } = useQuery(gql(queries.getChatIdByUserIds), {
    variables: { userIds }
  });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error getting chat id, {error.message}</div>;
  }

  return <MessageListContainer chatId={data.getChatIdByUserIds} />;
}

export default ({ userIds, chatId }) => {
  if (!chatId) {
    return <GetChatId userIds={userIds} />;
  }

  return <MessageListContainer chatId={chatId} />;
};
