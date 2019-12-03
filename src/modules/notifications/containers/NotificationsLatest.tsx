import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import NotificationsLatest from '../components/NotificationsLatest';
import { mutations } from '../graphql';
import { INotification, MarkAsReadMutationResponse } from '../types';

type Props = {
  notifications: INotification[];
  markAsRead: () => void;
  isLoading: boolean;
};

type FinalProps = Props & MarkAsReadMutationResponse;

const NotificationsLatestContainer = (props: FinalProps) => {
  const { markAsRead, isLoading, notificationsMarkAsReadMutation } = props;

  if (isLoading) {
    return <Spinner objective={true} />;
  }

  const getMutator = contextHandler => notificationIds => {
    notificationsMarkAsReadMutation({ variables: { _ids: notificationIds } })
      .then(() => {
        contextHandler();
        Alert.success('Notification have been seen');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    markAsRead: getMutator(markAsRead)
  };

  return <NotificationsLatest {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, MarkAsReadMutationResponse, { _ids: string[] }>(
      gql(mutations.markAsRead),
      { name: 'notificationsMarkAsReadMutation' }
    )
  )(NotificationsLatestContainer)
);
