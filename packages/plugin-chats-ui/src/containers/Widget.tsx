import React from 'react';
import { useQuery, useSubscription } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Spinner from '@erxes/ui/src/components/Spinner';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import Component from '../components/Widget';
import { queries, subscriptions } from '../graphql';

type Props = {
  currentUser: IUser;
};

const TopNavigationContainer = (props: Props) => {
  const { currentUser } = props;
  const { loading, error, data, refetch } = useQuery(gql(queries.chats));

  useSubscription(gql(subscriptions.chatInserted), {
    variables: { userId: currentUser._id },
    onSubscriptionData: () => {
      refetch();
    }
  });

  if (loading) {
    return (
      <Sidebar wide={true}>
        <Spinner />
      </Sidebar>
    );
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return <Component chats={data.chats.list} />;
};

export default withCurrentUser(TopNavigationContainer);
