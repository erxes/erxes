import gql from 'graphql-tag';
import * as React from 'react';
import DumbConversationList from '../components/ConversationInit';
import { connection } from '../connection';
import graphqTypes from '../graphql';
import { IConversation } from '../types';
import { useQuery } from '@apollo/react-hooks';
import { getMessengerData } from '../utils/util';
import { useRouter } from '../context/Router';
import { useConversation } from '../context/Conversation';

const ConversationInit = () => {
  const { setRoute } = useRouter();
  const { goToConversation, createConversation } = useConversation();
  const { data, loading } = useQuery(gql(graphqTypes.allConversations), {
    fetchPolicy: 'network-only',
    variables: connection.data,
    notifyOnNetworkStatusChange: true,
    // every minute
    pollInterval: connection.setting.pollInterval || 0,
  });

  const { responseRate } = getMessengerData();

  const goToAllConversations = () => {
    setRoute('allConversations');
  };

  return (
    <DumbConversationList
      loading={loading}
      conversations={data?.widgetsConversations || []}
      goToConversation={goToConversation}
      createConversation={createConversation}
      goToAllConversations={goToAllConversations}
      responseRate={responseRate}
    />
  );
};

export default ConversationInit;
