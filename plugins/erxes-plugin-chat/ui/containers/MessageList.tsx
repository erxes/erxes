import React from 'react';
import { useQuery, useSubscription } from 'react-apollo';
import gql from 'graphql-tag';
import Spinner from 'erxes-ui/lib/components/Spinner';
import { withCurrentUser } from 'erxes-ui';

import MessageList from '../components/MessageList';
import { queries, subscriptions } from '../graphql';

function MessageListContainer({ chatId, currentUser }) {
  const chatMessagesQuery = useQuery(gql(queries.chatMessages), {
    variables: {
      chatId
    }
  });

  const chatMessageSubscription = useSubscription(
    gql(subscriptions.chatMessageInserted),
    {
      variables: {
        userId: currentUser._id
      }
    }
  );

  console.log('chatMessageSubscription: ', chatMessageSubscription);

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

export default withCurrentUser(MessageListContainer);
