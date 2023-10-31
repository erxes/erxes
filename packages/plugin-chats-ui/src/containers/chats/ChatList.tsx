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
  isForward?: boolean;
  forwardChat?: (id: string, type: string) => void;
  forwardedChatIds?: string[];
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ChatListContainer = (props: FinalProps) => {
  const { currentUser, isWidget, chatId } = props;
  const [togglePinnedChat] = useMutation(gql(mutations.chatToggleIsPinned));
  const history = useHistory();
  const limit = parseInt(router.getParam(history, 'limit'), 20);

  const [loadingMore, setLoadingMore] = useState(false);

  const { loading, error, data, refetch, fetchMore } = useQuery(
    gql(queries.chats),
    {
      fetchPolicy: 'network-only'
    }
  );

  const usersQuery = useQuery(gql(queries.allUsers), {
    variables: {
      isActive: true
    }
  });

  const togglePinned = () => {
    togglePinnedChat({
      variables: { id: chatId },
      refetchQueries: [{ query: gql(queries.chats) }]
    }).catch(e => {
      Alert.error(e.message);
    });
  };

  if (isWidget) {
    refetch();
  }

  useSubscription(gql(subscriptions.chatInserted), {
    variables: { userId: currentUser._id },
    onSubscriptionData: () => {
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
        const totalCounts = fetchMoreResult.chats.totalCount || 1;
        setLoadingMore(false);
        if (result.length > 0) {
          return {
            ...prev,
            chats: {
              ...prev.chats,
              list: [...result],
              totalCount: totalCounts
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
      allUsers={usersQuery?.data?.allUsers}
      forwardChat={props.forwardChat}
    />
  );
};

const WithCurrentUser = withCurrentUser(ChatListContainer);

export default (props: Props) => <WithCurrentUser {...props} />;
