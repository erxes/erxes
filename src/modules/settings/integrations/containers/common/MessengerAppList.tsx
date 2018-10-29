import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, confirm, withProps } from 'modules/common/utils';
import {
  mutations as inboxMutations,
  queries as inboxQueries
} from 'modules/inbox/graphql';
import {
  MessengerAppsQueryResponse,
  MessengerAppsRemoveMutationResponse
} from 'modules/inbox/types';
import { MessengerAppList } from 'modules/settings/integrations/components/common';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  queryParams: any;
  kind?: string | null;
};

type FinalProps = {
  messengerAppsQuery: MessengerAppsQueryResponse;
} & Props &
  MessengerAppsRemoveMutationResponse;

const MessengerAppContainer = (props: FinalProps) => {
  const { messengerAppsQuery, removeMutation } = props;

  if (messengerAppsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const messengerApps = messengerAppsQuery.messengerApps || [];

  const remove = app => {
    confirm().then(() => {
      removeMutation({ variables: { _id: app._id } })
        .then(() => {
          Alert.success('Congrats');
        })

        .catch(error => {
          Alert.error(error.reason);
        });
    });
  };

  const updatedProps = {
    ...props,
    remove,
    messengerApps
  };

  return <MessengerAppList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, MessengerAppsQueryResponse>(
      gql(inboxQueries.messengerApps),
      {
        name: 'messengerAppsQuery',
        options: ({ kind }) => {
          return {
            variables: { kind },
            fetchPolicy: 'network-only'
          };
        }
      }
    ),
    graphql<Props, MessengerAppsRemoveMutationResponse>(
      gql(inboxMutations.messengerAppsRemove),
      {
        name: 'removeMutation',
        options: ({ kind }) => {
          return {
            refetchQueries: [
              {
                query: gql(inboxQueries.messengerApps),
                variables: { kind }
              }
            ]
          };
        }
      }
    )
  )(MessengerAppContainer)
);
