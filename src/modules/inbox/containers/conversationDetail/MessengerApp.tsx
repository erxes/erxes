import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { MessengerApp } from 'modules/inbox/components/conversationDetail';
import { mutations } from 'modules/inbox/graphql';
import { queries as integrationQueries } from 'modules/settings/integrations/graphql';
import {
  IMessengerApp,
  MessengerAppsQueryResponse
} from 'modules/settings/integrations/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  ExecuteAppMutationResponse,
  ExecuteAppMutationVariables,
  IConversation
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
      Alert.success(`You successfully executed an app`);
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
    graphql<Props, MessengerAppsQueryResponse>(
      gql(integrationQueries.messengerApps),
      {
        name: 'messengerAppsQuery',
        options: () => ({
          variables: { kind: 'googleMeet' },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ExecuteAppMutationResponse, ExecuteAppMutationVariables>(
      gql(mutations.executeApp),
      {
        name: 'executeAppMutation'
      }
    )
  )(MessengerAppContainer)
);
