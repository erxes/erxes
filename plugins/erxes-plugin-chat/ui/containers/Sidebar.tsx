import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';

import Sidebar from '../components/Sidebar';
import { queries } from '../graphql';

export default function SidebarContainer() {
  const chatsResponse = useQuery(gql(queries.chats));

  if (chatsResponse.loading) {
    return <div>...</div>;
  }

  if (chatsResponse.error) {
    return <div>{chatsResponse.error.message}</div>;
  }

  return <Sidebar chats={chatsResponse.data.chats} />;
}
