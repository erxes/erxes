import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import queryString from 'query-string';
import gql from 'graphql-tag';
// erxes
import Spinner from '@erxes/ui/src/components/Spinner';
// local
import Chat from '../components/Chat';
import { queries } from '../graphql';

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
    return <div>{error.message}</div>;
  }

  return <Chat chatId={data.getChatIdByUserIds} />;
};

export default ChatContainer;
