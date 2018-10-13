import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { MessengerApp } from 'modules/inbox/components/conversationDetail';
import { mutations, queries } from 'modules/inbox/graphql';
import { IMessengerApp } from 'modules/settings/integrations/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IConversation } from '../../types';

type Props = {
  conversation: IConversation;
  messengerAppsQuery: any;
  executeAppMutation: (
    doc: { variables: { _id: string; conversationId: string } }
  ) => Promise<any>;
};

const MessengerAppContainer = (props: Props) => {
  const { conversation, messengerAppsQuery, executeAppMutation } = props;

  if (messengerAppsQuery.loading) {
    return null;
  }

  const onSelect = (app?: IMessengerApp) => {
    if (!app) return null;

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

export default compose(
  graphql(gql(queries.messengerApps), {
    name: 'messengerAppsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.executeApp), {
    name: 'executeAppMutation'
  })
)(MessengerAppContainer);
