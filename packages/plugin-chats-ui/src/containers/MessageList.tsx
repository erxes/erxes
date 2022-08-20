import React from 'react';
import { useQuery, useSubscription } from 'react-apollo';
import gql from 'graphql-tag';
import Spinner from '@erxes/ui/src/components/Spinner';
import MessageList from '../components/MessageList';
import { queries, subscriptions } from '../graphql';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';

type IProps = {
  chatId: string;
};

type FinalProps = {
  currentUser: IUser;
} & IProps;

function ListContainer({ chatId, currentUser }: FinalProps) {
  const chatMessagesQuery = useQuery(gql(queries.chatMessages), {
    variables: {
      chatId
    }
  });

  const chatMessageSubscription = useSubscription(
    gql(subscriptions.chatMessageInserted),
    {
      variables: {
        chatId: chatId
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

  return (
    <MessageList
      messages={chatMessagesQuery.data.chatMessages.list}
      currentUser={currentUser}
    />
  );
}

const WithCurrentUser = withCurrentUser(ListContainer);

const MessageListContainer = (props: IProps) => {
  return <WithCurrentUser {...props} />;
};

export default MessageListContainer;
