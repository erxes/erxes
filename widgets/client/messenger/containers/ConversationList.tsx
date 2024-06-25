import gql from 'graphql-tag';
import * as React from 'react';
import DumbConversationList from '../components/ConversationList';
import { connection } from '../connection';
import graphqTypes from '../graphql';
import { IConversation } from '../types';
import { useQuery } from '@apollo/react-hooks';
import { useAppContext } from './AppContext';

type QueryResponse = {
  widgetsConversations: IConversation[];
};

const ConversationList = () => {
  const { goToConversation, changeRoute } = useAppContext();
  const createConversation = () => {
    changeRoute('conversationCreate');
  };
  const goToHome = () => {
    changeRoute('home');
  };

  const { data, loading } = useQuery(gql(graphqTypes.allConversations), {
    fetchPolicy: 'network-only',
    variables: connection.data,
  });

  // show empty list while waiting

  return (
    <DumbConversationList
      loading={loading}
      conversations={loading ? [] : data.widgetsConversations || []}
      goToConversation={goToConversation}
      createConversation={createConversation}
      goToHome={goToHome}
    />
  );
};

export default ConversationList;
