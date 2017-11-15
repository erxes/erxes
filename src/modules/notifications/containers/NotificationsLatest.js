import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { queries, mutations, subscriptions } from '../graphql';
import { Loading } from 'modules/common/components';
import { NotificationsLatest } from '../components';

class NotificationsLatestContainer extends React.Component {
  subscribe(ids) {
    this.props.notificationsQuery.subscribeToMore({
      // listen for all notifications changes
      document: gql(subscriptions.notificationsChanged),
      variables: { ids },

      updateQuery: () => {
        this.props.notificationsQuery.refetch();
      }
    });
  }

  render() {
    const { notificationsQuery, notificationsMarkAsReadMutation } = this.props;

    if (notificationsQuery.loading) {
      return <Loading title="Notifications" />;
    }

    const markAsRead = _ids => {
      this.subscribe(_ids);

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
      notifications: notificationsQuery.notifications
    };

    return <NotificationsLatest {...updatedProps} />;
  }
}

NotificationsLatestContainer.propTypes = {
  notificationsQuery: PropTypes.object,
  notificationsMarkAsReadMutation: PropTypes.func
};

export default compose(
  graphql(gql(mutations.markAsRead), {
    name: 'notificationsMarkAsReadMutation'
  }),
  graphql(gql(queries.notifications), {
    name: 'notificationsQuery',
    options: () => ({
      variables: {
        limit: 10,
        requireRead: false
      }
    })
  })
)(NotificationsLatestContainer);
