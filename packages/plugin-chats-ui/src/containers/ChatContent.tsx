import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from '@erxes/ui/src/utils';

import ChatContent from '../components/ChatContent';
import { mutations, queries } from '../graphql';

type Props = {
  chatId: string;
};

const ChatContentContainer = (props: Props) => {
  const { chatId } = props;
  const [addMutation] = useMutation(gql(mutations.addChatMessage));

  const sendMessage = (content: string) => {
    if (!content) {
      return Alert.error('Content is required');
    }

    addMutation({
      variables: { content, chatId },
      refetchQueries: [
        {
          query: gql(queries.chatMessages),
          variables: { chatId }
        },
        {
          query: gql(queries.chats)
        }
      ]
    }).catch(error => {
      Alert.error(error.message);
    });
  };

  return <ChatContent {...props} sendMessage={sendMessage} />;
};

export default ChatContentContainer;
