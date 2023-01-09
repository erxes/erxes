import React from 'react';
import { useQuery, useSubscription } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import Spinner from '@erxes/ui/src/components/Spinner';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import { queries, subscriptions } from '../graphql';
import ChatHistory from '../components/ChatHistory';

type IProps = {
  chatId: string;
};

type FinalProps = {
  currentUser: IUser;
} & IProps;

const ChatHistoryContainer = (props: FinalProps) => {
  const { chatId, currentUser } = props;

  const chatMessagesQuery = useQuery(gql(queries.chatMessages), {
    variables: { chatId }
  });

  useSubscription(gql(subscriptions.chatMessageInserted), {
    variables: {
      chatId: chatId
    },
    onSubscriptionData: () => {
      chatMessagesQuery.refetch();
    }
  });

  if (chatMessagesQuery.loading) {
    return <Spinner />;
  }

  if (chatMessagesQuery.error) {
    return <p>{chatMessagesQuery.error.message}</p>;
  }

  return (
    <ChatHistory
      messages={chatMessagesQuery.data.chatMessages.list}
      currentUser={currentUser}
    />
  );
};

const WithCurrentUser = withCurrentUser(ChatHistoryContainer);

export default function(props: IProps) {
  return <WithCurrentUser {...props} />;
}
