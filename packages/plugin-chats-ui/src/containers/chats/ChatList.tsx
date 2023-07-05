import React from 'react';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import Component from '../../components/chats/ChatList';
import { mutations, queries, subscriptions } from '../../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';

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

  const { loading, error, data, refetch } = useQuery(gql(queries.chats));

  const togglePinned = () => {
    togglePinnedChat({
      variables: { id: chatId },
      refetchQueries: [{ query: gql(queries.chats) }]
    })
      .then(data => {
        console.log(data, 'data');
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

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (error) {
    Alert.error(error.message);
  }

  return (
    <Component
      {...props}
      chats={data.chats.list || []}
      currentUser={currentUser}
      togglePinned={togglePinned}
    />
  );
};

const WithCurrentUser = withCurrentUser(ChatListContainer);

export default (props: Props) => <WithCurrentUser {...props} />;
