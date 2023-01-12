import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from '@erxes/ui/src/utils';

import ChatInput from '../components/ChatInput';
import { mutations, queries } from '../graphql';

type Props = {
  chatId: string;
  reply?: any;
  setReply: (message: any) => void;
};

const ChatInputContainer = (props: Props) => {
  const { chatId, reply } = props;
  const [addMutation] = useMutation(gql(mutations.addChatMessage));

  const sendMessage = (content: string) => {
    if (!content) {
      return;
    }

    const relatedId = (reply && reply._id) || null;

    addMutation({
      variables: { content, chatId, relatedId },
      refetchQueries: [{ query: gql(queries.chats) }]
    }).catch(error => {
      Alert.error(error.message);
    });
  };

  return <ChatInput {...props} sendMessage={sendMessage} />;
};

export default ChatInputContainer;
