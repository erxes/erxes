import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'erxes-ui/lib/utils';

import ChatDetail from '../components/ChatDetail';
import { mutations, queries } from '../graphql';

type Props = {
  chatId: string;
};

export default function ChatDetailContainer(props: Props) {
  const [addMutation] = useMutation(gql(mutations.addChatMessage));

  const sendMessage = (content: string) => {
    const { chatId } = props;

    addMutation({
      variables: { content, chatId },
      refetchQueries: [
        {
          query: gql(queries.chatMessages),
          variables: { chatId }
        }
      ]
    }).then(() => {
      Alert.success('Successfully added');
    });
  };

  return <ChatDetail {...props} sendMessage={sendMessage} />;
}
