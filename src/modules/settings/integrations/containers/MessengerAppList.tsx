import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { MessengerAppList } from '../components';
import { mutations, queries } from '../graphql';
import {
  MessengerAppsQueryResponse,
  MessengerAppsRemoveMutationResponse
} from '../types';

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
      Alert.warning('Removing... Please wait!!!');

      removeMutation({ variables: { _id: app._id } })
        .then(() => {
          Alert.success('You successfully deleted a messenger');
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
    graphql<Props, MessengerAppsQueryResponse>(gql(queries.messengerApps), {
      name: 'messengerAppsQuery',
      options: ({ kind }) => {
        return {
          variables: { kind },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<Props, MessengerAppsRemoveMutationResponse>(
      gql(mutations.messengerAppsRemove),
      {
        name: 'removeMutation',
        options: ({ kind }) => {
          return {
            refetchQueries: [
              {
                query: gql(queries.messengerApps),
                variables: { kind }
              },
              {
                query: gql(queries.messengerAppsCount),
                variables: { kind }
              }
            ]
          };
        }
      }
    )
  )(MessengerAppContainer)
);
