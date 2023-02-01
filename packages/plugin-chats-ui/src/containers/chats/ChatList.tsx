import React from 'react';
import { useQuery, useSubscription } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import Component from '../../components/chats/ChatList';
import { queries, subscriptions } from '../../graphql';

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
  const { currentUser } = props;
  const { loading, error, data, refetch } = useQuery(gql(queries.chats));

  useSubscription(gql(subscriptions.chatInserted), {
    variables: { userId: currentUser._id },
    onSubscriptionData: () => {
      refetch();
    }
  });

  if (loading) {
    return <p>...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <Component {...props} chats={data.chats.list} currentUser={currentUser} />
  );
};

const WithCurrentUser = withCurrentUser(ChatListContainer);

export default (props: Props) => <WithCurrentUser {...props} />;
