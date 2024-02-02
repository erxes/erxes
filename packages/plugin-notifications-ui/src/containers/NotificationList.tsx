import { Alert } from '@erxes/ui/src/utils';
import {
  MarkAsReadMutationResponse,
  NotificationsCountQueryResponse,
  NotificationsQueryResponse,
} from '@erxes/ui-notifications/src/types';
import { mutations, queries } from '@erxes/ui-notifications/src/graphql';

import { IQueryParams } from '@erxes/ui/src/types';
import NotificationList from '../components/NotificationList';
import React from 'react';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql, useQuery, useMutation } from '@apollo/client';

type Props = {
  queryParams: IQueryParams;
};

const NotificationListContainer = (props: Props) => {
  const { queryParams } = props;

  // Queries
  const notificationsQuery = useQuery<NotificationsQueryResponse>(
    gql(queries.notifications),
    {
      variables: {
        ...generatePaginationParams(queryParams),
        requireRead: queryParams.requireRead === 'true' ? true : false,
        title: queryParams.title,
      },
    },
  );

  const notificationCountQuery = useQuery<NotificationsCountQueryResponse>(
    gql(queries.notificationCounts),
    {
      variables: {
        requireRead: queryParams.requireRead === 'true' ? true : false,
      },
    },
  );

  // Mutations
  const [notificationsMarkAsReadMutation] =
    useMutation<MarkAsReadMutationResponse>(gql(mutations.markAsRead), {
      refetchQueries: [
        {
          query: gql(queries.notifications),
          variables: {
            limit: 10,
            requireRead: false,
          },
        },
        'notificationCounts',
      ],
    });

  // Methods
  const markAsRead = (notificationIds?: string[]) => {
    notificationsMarkAsReadMutation({
      variables: { _ids: notificationIds },
    })
      .then(() => {
        if (notificationsQuery.refetch) {
          notificationsQuery.refetch();
          notificationCountQuery.refetch();
        }

        Alert.success('Notification have been seen');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  // Definitions
  const updatedProps = {
    ...props,
    markAsRead,
    notifications: notificationsQuery.data?.notifications || [],
    count: notificationCountQuery.data?.notificationCounts || 0,
    loading: notificationsQuery.loading || notificationCountQuery.loading,
  };

  return <NotificationList {...updatedProps} />;
};

export default NotificationListContainer;
