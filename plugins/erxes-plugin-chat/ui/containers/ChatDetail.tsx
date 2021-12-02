import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'erxes-ui/lib/utils';

import ChatDetail from '../components/ChatDetail';
import { mutations, queries } from '../graphql';

type Props = {
  chatId?: string;
  userIds?: string[];
};

export default function ChatDetailContainer(props: Props) {
  const [addMutation] = useMutation(gql(mutations.addChatMessage));

  const sendMessage = (content: string) => {
    const { chatId, userIds } = props;

    addMutation({
      variables: { content, chatId, participantIds: userIds || [] },
      refetchQueries: [
        {
          query: gql(queries.chatMessages),
          variables: { chatId, userIds }
        },
        {
          query: gql(queries.chats),
          variables: { type: 'direct' }
        }
      ]
    }).catch(error => {
      Alert.error(error.message);
    });
  };

  return <ChatDetail {...props} sendMessage={sendMessage} />;
}
