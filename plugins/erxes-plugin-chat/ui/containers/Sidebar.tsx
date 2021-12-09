import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';

import Sidebar from '../components/Sidebar';
import { queries } from '../graphql';

export default function SidebarContainer() {
  const directChatsResponse = useQuery(gql(queries.chats), {
    variables: { type: 'direct' }
  });

  const groupChatResponse = useQuery(gql(queries.chats), {
    variables: { type: 'group' }
  });

  if (groupChatResponse.loading || directChatsResponse.loading) {
    return <div>...</div>;
  }

  if (directChatsResponse.error) {
    return <div>{directChatsResponse.error.message}</div>;
  }

  if (groupChatResponse.error) {
    return <div>{groupChatResponse.error.message}</div>;
  }

  return (
    <Sidebar
      groupChats={groupChatResponse.data.chats.list}
      directChats={directChatsResponse.data.chats.list}
    />
  );
}
