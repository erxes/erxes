import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { MessengerApp } from 'modules/inbox/components/conversationDetail';
import { mutations, queries } from 'modules/inbox/graphql';
import { IMessengerApp } from 'modules/settings/integrations/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  ExecuteAppMutationResponse,
  ExecuteAppMutationVariables,
  IConversation,
  MessengerAppsQueryResponse
} from '../../types';

type Props = {
  conversation: IConversation;
};

type FinalProps = {
  messengerAppsQuery: MessengerAppsQueryResponse;
} & Props &
  ExecuteAppMutationResponse;

const MessengerAppContainer = (props: FinalProps) => {
  const { conversation, messengerAppsQuery, executeAppMutation } = props;

  if (messengerAppsQuery.loading) {
    return null;
  }

  const onSelect = (app?: IMessengerApp) => {
    if (!app) {
      return null;
    }

    const variables = {
      _id: app._id,
      conversationId: conversation._id
    };

    return executeAppMutation({ variables }).then(() => {
      Alert.success('Success');
    });
  };

  const updatedProps = {
    ...props,
    onSelect,
    messengerApps: messengerAppsQuery.messengerApps
  };

  return <MessengerApp {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, MessengerAppsQueryResponse>(gql(queries.messengerApps), {
      name: 'messengerAppsQuery',
      options: () => ({
        variables: { kind: 'googleMeet' },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, ExecuteAppMutationResponse, ExecuteAppMutationVariables>(
      gql(mutations.executeApp),
      {
        name: 'executeAppMutation'
      }
    )
  )(MessengerAppContainer)
);
