import gql from 'graphql-tag';
import * as React from 'react';
import ConversationList from '../components/ConversationList';
import { connection } from '../connection';
import graphqTypes from '../graphql';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from '../context/Router';
import { useConversation } from '../context/Conversation';

const ConversationListContainer = ({ loading }: { loading: boolean }) => {
  const { setRoute } = useRouter();
  const { goToConversation, createConversation } = useConversation();

  const goToHome = () => {
    setRoute('home');
  };

  const { data, loading: loadingConversations } = useQuery(
    gql(graphqTypes.allConversations),
    {
      fetchPolicy: 'network-only',
      variables: connection.data,
    }
  );

  return (
    <ConversationList
      loading={loading || loadingConversations}
      conversations={data?.widgetsConversations || []}
      goToConversation={goToConversation}
      createConversation={createConversation}
      goToHome={goToHome}
    />
  );
};

export default ConversationListContainer;
