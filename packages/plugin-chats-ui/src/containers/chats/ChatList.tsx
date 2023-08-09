import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { gql } from '@apollo/client';
// erxes
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import Component from '../../components/chats/ChatList';
import { mutations, queries, subscriptions } from '../../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';
import * as router from '@erxes/ui/src/utils/router';
type Props = {
  chatId?: string;
  hasOptions?: boolean;
  isWidget?: boolean;
  handleClickItem?: (chatId: string) => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ChatListContainer = (props: FinalProps) => {
  const { currentUser, isWidget, chatId } = props;
  const [togglePinnedChat] = useMutation(gql(mutations.chatToggleIsPinned));
  const history = useHistory();
  const limit = parseInt(router.getParam(history, 'limit'));

  const [loadingMore, setLoadingMore] = useState(false);
  const [isToggled, setIsToggled] = useState(false);

  const { loading, error, data, refetch, fetchMore } = useQuery(
    gql(queries.chats),
    {
      fetchPolicy: 'network-only'
    }
  );

  const togglePinned = () => {
    togglePinnedChat({
      variables: { id: chatId },
      refetchQueries: [{ query: gql(queries.chats) }]
    })
      .then(data => {
        setIsToggled(data?.data?.chatToggleIsPinned || false);
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  if (isWidget) {
    refetch();
  }

  useSubscription(gql(subscriptions.chatInserted), {
    variables: { userId: currentUser._id },
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      refetch();
    }
  });

  const loadEarlierChat = () => {
    setLoadingMore(true);
    fetchMore({
      variables: {
        chatId,
        limit
      },
      updateQuery(prev, { fetchMoreResult }) {
        const result = fetchMoreResult.chats.list || [];
        const totalCount = fetchMoreResult.chats.totalCount || 1;
        setLoadingMore(false);
        if (result.length > 0) {
          return {
            ...prev,
            chats: {
              ...prev.chats,
              list: [...result],
              totalCount: totalCount
            }
          };
        }

        return prev;
      }
    });
  };

  useEffect(() => {
    loadEarlierChat();
  }, [limit]);

  if (loading || loadingMore) {
    return <Spinner objective={true} />;
  }

  if (error) {
    Alert.error(error.message);
  }
  const chats = data.chats.list || [];
  const totalCount = data.chats.totalCount || 1;

  return (
    <Component
      {...props}
      chats={chats}
      currentUser={currentUser}
      togglePinned={togglePinned}
      loadEarlierChat={loadEarlierChat}
      loading={loading}
      totalCount={totalCount}
    />
  );
};

const WithCurrentUser = withCurrentUser(ChatListContainer);

export default (props: Props) => <WithCurrentUser {...props} />;
