import gql from 'graphql-tag';
import { mutations, queries } from '../../graphql';
import { useMutation } from '@apollo/client';
import Alert from '@erxes/ui/src/utils/Alert';
import ChatForward from '../../components/chats/ChatForward';
import { IUser } from '@erxes/ui/src/auth/types';
import React, { useState } from 'react';

type Props = {
  currentUser: IUser;
  content?: any;
  attachments?: any;
  isWidget: boolean;
};

const ChatForwardContainer = (props: Props) => {
  const [forwardedChatIds, setForwardedChatIds] = useState([]);

  const [chatForward] = useMutation(gql(mutations.chatForward));

  const forwardChat = (id: string, type: string) => {
    if (type === 'group') {
      chatForward({
        variables: {
          chatId: id,
          content: props.content,
          attachments: props.attachments
        },
        refetchQueries: [{ query: gql(queries.chats) }]
      })
        .then(() => {
          setForwardedChatIds([...forwardedChatIds, id]);
        })
        .catch(error => Alert.error(error.message));
    }

    if (type === 'direct') {
      chatForward({
        variables: {
          userIds: [id],
          content: props.content,
          attachments: props.attachments
        },
        refetchQueries: [{ query: gql(queries.chats) }]
      })
        .then(() => {
          setForwardedChatIds([...forwardedChatIds, id]);
        })
        .catch(error => Alert.error(error.message));
    }
  };

  return (
    <ChatForward
      {...props}
      currentUser={props.currentUser}
      forwardedChatIds={forwardedChatIds}
      forwardChat={forwardChat}
    />
  );
};

export default ChatForwardContainer;
