import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import NotificationList from '../components/NotificationList';
import { NotifConsumer } from '../context';
import { queries } from '../graphql';
import {
  MarkAsReadMutationResponse,
  NotificationsCountQueryResponse,
  NotificationsQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  markAsRead: (notificationIds?: string[]) => void;
};

type FinalProps = {
  notificationsQuery: NotificationsQueryResponse;
  notificationCountQuery: NotificationsCountQueryResponse;
} & Props &
  MarkAsReadMutationResponse;

class NotificationListContainer extends React.Component<FinalProps> {
  render() {
    const { notificationsQuery, notificationCountQuery } = this.props;

    const updatedProps = {
      ...this.props,
      notifications: notificationsQuery.notifications || [],
      count: notificationCountQuery.notificationCounts || 0,
      loading: notificationsQuery.loading
    };

    return <NotificationList {...updatedProps} />;
  }
}

const List = withProps<Props>(
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
    )
  )(NotificationListContainer)
);

export default props => (
  <NotifConsumer>
    {({ markAsRead }) => {
      const updatedProps = {
        markAsRead,
        ...props
      };
      return <List {...updatedProps} />;
    }}
  </NotifConsumer>
);
