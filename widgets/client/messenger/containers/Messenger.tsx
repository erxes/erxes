import gql from 'graphql-tag';
import * as React from 'react';
import DumbMessenger from '../components/Messenger';
import { connection } from '../connection';
import graphqTypes from '../graphql';
import { IMessengerSupporters } from '../types';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from '../context/Router';

type QueryResponse = {
  widgetsMessengerSupporters: IMessengerSupporters;
};

const MessengerContainer = () => {
  const { activeRoute } = useRouter();

  const { data, loading } = useQuery(
    gql(graphqTypes.messengerSupportersQuery),
    {
      variables: {
        integrationId: connection.data.integrationId,
      },
      fetchPolicy: 'network-only',
    }
  );

  const info = data && data.widgetsMessengerSupporters;
  let supporters: any = [];
  let isOnline = false;

  if (info) {
    if (info.supporters) {
      supporters = info.supporters;
    }
    if (info.isOnline) {
      isOnline = info.isOnline;
    }
  }

  return (
    <DumbMessenger
      activeRoute={activeRoute}
      loading={loading}
      supporters={supporters}
      isOnline={isOnline}
    />
  );
};

export default MessengerContainer;
