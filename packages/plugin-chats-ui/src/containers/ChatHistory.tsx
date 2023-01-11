import React, { useState, useEffect } from 'react';
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
  setReply: (message: any) => void;
};

type FinalProps = {
  currentUser: IUser;
} & IProps;

const ChatHistoryContainer = (props: FinalProps) => {
  const { chatId, setReply, currentUser } = props;
  const [page, setPage] = useState<number>(0);
  const [latestMessages, setLatestMessages] = useState<any[]>([]);

  const chatMessagesQuery = useQuery(gql(queries.chatMessages), {
    variables: { chatId, skip: 0 }
  });

  useEffect(() => {
    chatMessagesQuery.refetch();
    setLatestMessages([]);
    setPage(0);
  }, [chatId]);

  useSubscription(gql(subscriptions.chatMessageInserted), {
    variables: { chatId },
    onSubscriptionData: ({ subscriptionData }) => {
      if (!subscriptionData.data) return;

      setLatestMessages([
        subscriptionData.data.chatMessageInserted,
        ...latestMessages
      ]);
    }
  });

  if (chatMessagesQuery.loading) {
    return <Spinner />;
  }

  if (chatMessagesQuery.error) {
    return <p>{chatMessagesQuery.error.message}</p>;
  }

  const chatMessages =
    (chatMessagesQuery.data && chatMessagesQuery.data.chatMessages.list) || [];

  const loadEarlierMessage = () => {
    const nextPage = page + 1;

    if (chatMessages.length < nextPage * 20) {
      return;
    }

    const skip: number =
      nextPage * 20 + (latestMessages && latestMessages.length);

    chatMessagesQuery.fetchMore({
      variables: {
        chatId,
        skip
      },
      updateQuery(prev, { fetchMoreResult }) {
        const result = fetchMoreResult.chatMessages.list || [];

        if (result.length > 0) {
          setPage(nextPage);

          return {
            ...prev,
            chatMessages: {
              ...prev.chatMessages,
              list: [...prev.chatMessages.list, ...result]
            }
          };
        }

        return prev;
      }
    });
  };

  return (
    <ChatHistory
      messages={chatMessages}
      latestMessages={latestMessages}
      currentUser={currentUser}
      setReply={setReply}
      loadEarlierMessage={loadEarlierMessage}
    />
  );
};

const WithCurrentUser = withCurrentUser(ChatHistoryContainer);

export default function(props: IProps) {
  return <WithCurrentUser {...props} />;
}
