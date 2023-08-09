import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  MarkAsReadMutationResponse,
  NotificationsCountQueryResponse,
  NotificationsQueryResponse
} from '@erxes/ui-notifications/src/types';
import { mutations, queries } from '@erxes/ui-notifications/src/graphql';

import { IQueryParams } from '@erxes/ui/src/types';
import NotificationList from '../components/NotificationList';
import React from 'react';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  queryParams: IQueryParams;
};

type FinalProps = {
  notificationsQuery: NotificationsQueryResponse;
  notificationCountQuery: NotificationsCountQueryResponse;
} & Props &
  MarkAsReadMutationResponse;

class NotificationListContainer extends React.Component<FinalProps> {
  render() {
    const {
      notificationsQuery,
      notificationCountQuery,
      notificationsMarkAsReadMutation
    } = this.props;

    const markAsRead = (notificationIds?: string[]) => {
      notificationsMarkAsReadMutation({
        variables: { _ids: notificationIds }
      })
        .then(() => {
          if (notificationsQuery.refetch) {
            notificationsQuery.refetch();
            notificationCountQuery.refetch();
          }

          Alert.success('Notification have been seen');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      markAsRead,
      notifications: notificationsQuery.notifications || [],
      count: notificationCountQuery.notificationCounts || 0,
      loading: notificationsQuery.loading
    };

    return <NotificationList {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      NotificationsQueryResponse,
      { requireRead: boolean; page?: number; perPage?: number; title?: string }
    >(gql(queries.notifications), {
      name: 'notificationsQuery',
      options: ({ queryParams }) => ({
        variables: {
          ...generatePaginationParams(queryParams),
          requireRead: queryParams.requireRead === 'true' ? true : false,
          title: queryParams.title
        }
      })
    }),
    graphql<Props, NotificationsCountQueryResponse>(
      gql(queries.notificationCounts),
      {
        name: 'notificationCountQuery',
        options: ({ queryParams }) => ({
          variables: {
            requireRead: queryParams.requireRead === 'true' ? true : false
          }
        })
      }
    ),
    graphql<Props, MarkAsReadMutationResponse, { _ids?: string[] }>(
      gql(mutations.markAsRead),
      {
        name: 'notificationsMarkAsReadMutation',
        options: {
          refetchQueries: [
            {
              query: gql(queries.notifications),
              variables: {
                limit: 10,
                requireRead: false
              }
            },
            'notificationCounts'
          ]
        }
      }
    )
  )(NotificationListContainer)
);
