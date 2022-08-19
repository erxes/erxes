import React from 'react';
import { useMutation } from 'react-apollo';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from '@erxes/ui/src/utils';

import Sidebar from '../components/Sidebar';
import { mutations, queries } from '../graphql';

export default function SidebarContainer() {
  const [addChatMutation] = useMutation(gql(mutations.addChat));

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

  const startGroupChat = (name: string, userIds: string[]) => {
    if (!name) {
      return Alert.error('Name is required');
    }

    addChatMutation({
      variables: { name, type: 'group', participantIds: userIds || [] },
      refetchQueries: [
        {
          query: gql(queries.chats),
          variables: { type: 'group' }
        }
      ]
    }).catch(error => {
      Alert.error(error.message);
    });
  };

  return (
    <Sidebar
      startGroupChat={startGroupChat}
      groupChats={groupChatResponse.data.chats.list}
      directChats={directChatsResponse.data.chats.list}
    />
  );
}
