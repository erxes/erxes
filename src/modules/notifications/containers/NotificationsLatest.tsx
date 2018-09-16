import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { NotificationsLatest } from '../components';
import { mutations, queries } from '../graphql';

type Props = {
  notificationsQuery: any,
  notificationsMarkAsReadMutation: (params: { variables: { _ids: string[] } }) => any
};

class NotificationsLatestContainer extends React.Component<Props> {
  render() {
    const { notificationsQuery, notificationsMarkAsReadMutation } = this.props;

    if (notificationsQuery.loading) {
      return <Spinner objective />;
    }

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
      notifications: notificationsQuery.notifications
    };

    return <NotificationsLatest {...updatedProps} />;
  }
}

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
