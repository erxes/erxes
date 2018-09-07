import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import { Alert } from 'modules/common/utils';
import { NotificationList } from '../components';

class NotificationListContainer extends React.Component {
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

NotificationListContainer.propTypes = {
  queryParams: PropTypes.object,
  notificationsQuery: PropTypes.object,
  notificationCountQuery: PropTypes.object,
  notificationsMarkAsReadMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.notifications), {
    name: 'notificationsQuery',
    options: ({ queryParams }) => ({
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
