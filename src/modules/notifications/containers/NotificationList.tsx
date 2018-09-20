import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { NotificationList } from '../components';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  notificationsQuery: any;
  notificationCountQuery: any;
  notificationsMarkAsReadMutation: (params: { variables: { _ids: string[] } }) => any;
};

class NotificationListContainer extends React.Component<Props> {
  render() {
    const {
      notificationsQuery,
      notificationCountQuery,
      notificationsMarkAsReadMutation
    } = this.props;

    const markAsRead = _ids => {
      notificationsMarkAsReadMutation({ variables: { _ids } })
        .then(() => {
          notificationsQuery.refetch();
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
      count: notificationCountQuery.notificationCounts || 0
    };

    return <NotificationList {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(queries.notifications), {
    name: 'notificationsQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
      variables: {
        requireRead: false,
        page: queryParams.page,
        perPage: queryParams.perPage || 20,
        title: queryParams.title
      }
    })
  }),
  graphql(gql(queries.notificationCounts), {
    name: 'notificationCountQuery',
    options: () => ({
      variables: {
        requireRead: false
      }
    })
  }),
  graphql(gql(mutations.markAsRead), {
    name: 'notificationsMarkAsReadMutation'
  })
)(NotificationListContainer);
