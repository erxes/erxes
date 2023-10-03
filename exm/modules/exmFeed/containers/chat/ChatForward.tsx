import gql from 'graphql-tag';
import { mutations } from '../../graphql';
import { useMutation } from '@apollo/client';
import Alert from '../../../utils/Alert';
import ChatForward from '../../components/chat/ChatForward';
import { IUser } from '../../../auth/types';
import { useState } from 'react';

type Props = {
  currentUser: IUser;
  content?: any;
  attachments?: any;
};

const ChatForwardContainer = (props: Props) => {
  const [chatForward] = useMutation(gql(mutations.chatForward));

  const forwardChat = (id?: string, type?: string) => {
    if (type === 'group') {
      chatForward({
        variables: {
          chatId: id,
          content: props.content,
          attachments: props.attachments
        }
      })
        .then(() => {
          Alert.success('sent');
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    }

    if (type === 'direct') {
      chatForward({
        variables: {
          userIds: [id],
          content: props.content,
          attachments: props.attachments
        }
      })
        .then(() => {
          Alert.success('sent');
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    }
  };

  return (
    <ChatForward currentUser={props.currentUser} forwardChat={forwardChat} />
  );
};

export default ChatForwardContainer;
