import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from '@erxes/ui/src/utils';

import ChatDetail from '../components/ChatDetail';
import { mutations, queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  chatId?: string;
  userIds?: string[];
};

function ChatDetailContainer(props: Props) {
  const [addMutation] = useMutation(gql(mutations.addChatMessage));

  const sendMessage = (content: string) => {
    const { userIds, chatId } = props;

    if (!content) {
      return Alert.error('Content is required');
    }

    addMutation({
      variables: { content, chatId },
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

function GetChatId({ userIds }) {
  const { loading, data, error } = useQuery(gql(queries.getChatIdByUserIds), {
    variables: { userIds }
  });

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return <ChatDetailContainer chatId={data.getChatIdByUserIds} />;
}

export default ({ userIds, chatId }) => {
  if (!chatId) {
    return <GetChatId userIds={userIds} />;
  }

  return <ChatDetailContainer chatId={chatId} />;
};
