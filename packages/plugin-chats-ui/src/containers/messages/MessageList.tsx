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

type FinalProps = {
  currentUser: IUser;
} & Props;

const MessageListContainer = (props: FinalProps) => {
  const { chatId, currentUser } = props;

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

  if (chatMessagesQuery.loading) {
    return <Spinner />;
  }

  if (chatMessagesQuery.error) {
    return <p>{chatMessagesQuery.error.message}</p>;
  }

  const chatMessages =
    (chatMessagesQuery.data && chatMessagesQuery.data.chatMessages.list) || [];

  return (
    <Component
      messages={chatMessages}
      latestMessages={latestMessages}
      isAllMessages={chatMessages.length < (page + 1) * 20}
      currentUser={currentUser}
      setReply={props.setReply}
      loadEarlierMessage={loadEarlierMessage}
    />
  );
};

const WithCurrentUser = withCurrentUser(MessageListContainer);

export default (props: Props) => {
  return <WithCurrentUser {...props} />;
};
