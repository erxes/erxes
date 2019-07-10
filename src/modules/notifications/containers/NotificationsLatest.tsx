import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import NotificationsLatest from '../components/NotificationsLatest';
import { mutations, queries } from '../graphql';
import {
  MarkAsReadMutationResponse,
  NotificationsQueryResponse
} from '../types';

type Props = {
  update?: () => void;
};

type FinalProps = {
  notificationsQuery: NotificationsQueryResponse;
} & Props &
  MarkAsReadMutationResponse;

class NotificationsLatestContainer extends React.Component<FinalProps> {
  render() {
    const {
      notificationsQuery,
      notificationsMarkAsReadMutation,
      update
    } = this.props;

    if (notificationsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const markAsRead = notificationIds => {
      notificationsMarkAsReadMutation({ variables: { _ids: notificationIds } })
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
      update,
      notifications: notificationsQuery.notifications || []
    };

    return <NotificationsLatest {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, MarkAsReadMutationResponse, { _ids: string[] }>(
      gql(mutations.markAsRead),
      {
        name: 'notificationsMarkAsReadMutation',
        options: {
          refetchQueries: () => ['notificationCounts']
        }
      }
    ),
    graphql<
      Props,
      NotificationsQueryResponse,
      { limit: number; requireRead: boolean }
    >(gql(queries.notifications), {
      name: 'notificationsQuery',
      options: () => ({
        variables: {
          limit: 10,
          requireRead: false
        }
      })
    })
  )(NotificationsLatestContainer)
);
