import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import Spinner from 'erxes-ui/lib/components/Spinner';

import MessageList from '../components/MessageList';
import { queries } from '../graphql';

export default function MessageListContainer({ chatId, userIds }) {
  const chatMessagesQuery = useQuery(gql(queries.chatMessages), {
    variables: {
      chatId,
      userIds
    }
  });

  if (chatMessagesQuery.loading) {
    return <Spinner />;
  }

  if (chatMessagesQuery.error) {
    return <div>{chatMessagesQuery.error.message}</div>;
  }

  return <MessageList messages={chatMessagesQuery.data.chatMessages.list} />;
}
