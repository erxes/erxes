import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import Spinner from '@erxes/ui/src/components/Spinner';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import Component from '../../components/messages/MessageList';
import { queries, subscriptions } from '../../graphql';

type Props = {
  chatId: string;
  setReply: (message: any) => void;
};

const MessageListContainer = (props: Props) => {
  const { chatId } = props;

  const [page, setPage] = useState<number>(0);
  const [latestMessages, setLatestMessages] = useState<any[]>([]);
  const { loading, error, data, refetch, fetchMore } = useQuery(
    gql(queries.chatMessages),
    {
      variables: { chatId, skip: 0 }
    }
  );

  useEffect(() => {
    refetch();
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

  const loadEarlierMessage = () => {
    const nextPage = page + 1;

    if (chatMessages.length < nextPage * 20) {
      return;
    }

    const skip: number =
      nextPage * 20 + (latestMessages && latestMessages.length);

    fetchMore({
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

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  const chatMessages = (data && data.chatMessages.list) || [];

  return (
    <Component
      messages={chatMessages}
      latestMessages={latestMessages}
      isAllMessages={chatMessages.length < (page + 1) * 20}
      setReply={props.setReply}
      loadEarlierMessage={loadEarlierMessage}
    />
  );
};

export default MessageListContainer;
