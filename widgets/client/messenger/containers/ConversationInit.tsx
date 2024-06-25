import gql from 'graphql-tag';
import * as React from 'react';
import DumbConversationList from '../components/ConversationInit';
import { connection } from '../connection';
import graphqTypes from '../graphql';
import { IConversation } from '../types';
import { useQuery } from '@apollo/react-hooks';
import { useAppContext } from './AppContext';

type QueryResponse = {
  widgetsConversations: IConversation[];
};

const ConversationInit = () => {
  const { goToConversation, changeRoute, getMessengerData } = useAppContext();

  const { data, loading } = useQuery(gql(graphqTypes.allConversations), {
    fetchPolicy: 'network-only',
    variables: connection.data,
    notifyOnNetworkStatusChange: true,
    // every minute
    pollInterval: connection.setting.pollInterval || 0,
  });

  const { responseRate } = getMessengerData();
  const createConversation = () => {
    changeRoute('conversationCreate');
  };
  const goToAllConversations = () => {
    changeRoute('allConversations');
  };

  return (
    <DumbConversationList
      loading={loading}
      conversations={loading ? [] : data.widgetsConversations || []}
      goToConversation={goToConversation}
      createConversation={createConversation}
      goToAllConversations={goToAllConversations}
      responseRate={responseRate}
    />
  );
};

export default ConversationInit;
