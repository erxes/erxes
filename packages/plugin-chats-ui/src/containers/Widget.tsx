import { queries, subscriptions } from '../graphql';
import { useQuery, useSubscription } from '@apollo/client';

import { Alert } from '@erxes/ui/src/utils';
import { sendDesktopNotification } from '@erxes/ui/src/utils/core';
import Component from '../components/Widget';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import strip from 'strip';
type Props = {
  currentUser: IUser;
};

const WdigetListContainer = (props: Props) => {
  const { currentUser } = props;

  const { loading, error, data, refetch } = useQuery(
    gql(queries.getUnreadChatCount)
  );

  const {
    loading: notificationLoading,
    error: notificationError,
    data: notificationData
  } = useQuery(gql(queries.notificationsGetConfigurations), {});

  useSubscription(gql(subscriptions.chatInserted), {
    variables: { userId: currentUser._id },
    onSubscriptionData: data => {
      const { notificationsGetConfigurations } = notificationData;

      notificationsGetConfigurations?.map(notificationsGetConfiguration => {
        if (
          notificationsGetConfiguration.isAllowed &&
          notificationsGetConfiguration.notifType === 'chatReceive'
        ) {
          sendDesktopNotification({
            title: 'Chat recieved',
            content: strip('1111')
          });
          return;
        }
      });
    }
  });

  useSubscription(gql(subscriptions.chatUnreadCountChanged), {
    variables: { userId: currentUser._id },
    onSubscriptionData: data => {
      refetch();
    }
  });

  if (loading || notificationLoading) {
    return <Spinner objective={true} />;
  }

  if (error || notificationError) {
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
