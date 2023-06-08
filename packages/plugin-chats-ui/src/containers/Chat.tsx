import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import queryString from 'query-string';
import { gql } from '@apollo/client';
// erxes
import Spinner from '@erxes/ui/src/components/Spinner';
// local
import Chat from '../components/Chat';
import { queries } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';

const ChatContainer = () => {
  const location = useLocation();
  const { id, userIds, userId } = queryString.parse(location.search);

  if (!id && (userIds || userId)) {
    return <GetChatId userIds={userId ? [userId] : userIds} />;
  }

  return <Chat chatId={id || ''} />;
};

const GetChatId = (props: { userIds: string[] }) => {
  const { loading, error, data } = useQuery(gql(queries.getChatIdByUserIds), {
    variables: { userIds: props.userIds }
  });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    Alert.error(error.message);
  }

  return <Chat chatId={data.getChatIdByUserIds} />;
};

export default ChatContainer;
