import { queries, subscriptions } from '../graphql';
import { useQuery, useSubscription } from '@apollo/client';

import { Alert } from '@erxes/ui/src/utils';
import Component from '../components/Widget';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

type Props = {
  currentUser: IUser;
};

const WdigetListContainer = (props: Props) => {
  const { currentUser } = props;

  const { loading, error, data, refetch } = useQuery(
    gql(queries.getUnreadChatCount)
  );

  useSubscription(gql(subscriptions.chatUnreadCountChanged), {
    variables: { userId: currentUser._id },
    onSubscriptionData: () => {
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
      unreadCount={data.getUnreadChatCount || 0}
      currentUser={currentUser}
    />
  );
};

const WithCurrentUser = withCurrentUser(WdigetListContainer);

export default (props: Props) => <WithCurrentUser {...props} />;
