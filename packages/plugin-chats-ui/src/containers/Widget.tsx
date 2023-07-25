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
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      refetch();
    }
  });

  useSubscription(gql(subscriptions.chatReceivedNotification), {
    variables: { userId: currentUser._id },
    onSubscriptionData: (result: any) => {
      if (!result?.subscriptionData) {
        return null;
      }
      const { subscriptionData } = result;
      const { data } = subscriptionData;
      const { chatReceivedNotification } = data;
      const { content, mentionedUserIds } = chatReceivedNotification;

      const { notificationsGetConfigurations } = notificationData;

      notificationsGetConfigurations?.map(
        (notificationsGetConfiguration: any) => {
          if (
            notificationsGetConfiguration.isAllowed &&
            notificationsGetConfiguration.notifType === 'chatMention'
          ) {
            mentionedUserIds.map((mentionedUserId: string) => {
              if (currentUser._id === mentionedUserId) {
                sendDesktopNotification({
                  title: 'You mentioned in chats',
                  content: strip(content || '')
                });
                return;
              }
            });
          }
          if (
            notificationsGetConfiguration.isAllowed &&
            notificationsGetConfiguration.notifType === 'chatReceive'
          ) {
            sendDesktopNotification({
              title: 'Chat recieved',
              content: strip(content || '')
            });
            return;
          }
        }
      );
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
