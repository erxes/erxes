import React, { useEffect } from 'react';
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
  const { _id, userIds, userId } = queryString.parse(location.search);

  if (!_id) {
    return <GetChatId userIds={userId ? [userId] : userIds} />;
  }

  return <Chat chatId={_id} />;
};

const GetChatId = (props: { userIds: string[] }) => {
  const getChatIdByUserIds = useQuery(gql(queries.getChatIdByUserIds), {
    variables: { userIds: props.userIds }
  });

  if (getChatIdByUserIds.loading) {
    return <Spinner />;
  }

  if (getChatIdByUserIds.error) {
    return <div>{getChatIdByUserIds.error.message}</div>;
  }

  return <Chat chatId={getChatIdByUserIds.data.getChatIdByUserIds} />;
};

export default ChatContainer;
