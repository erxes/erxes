import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import gql from 'graphql-tag';
// erxes
import Alert from '../../../utils/Alert';
import confirm from '../../../utils/confirmation/confirm';
// local
import Component from '../../components/chat/ChatItem';
import { queries, mutations } from '../../graphql';
import { IUser } from '../../../auth/types';

type Props = {
  chat?: any;
  isWidget?: boolean;
  hasOptions?: boolean;
  handleClickItem?: (chatId: string) => void;
  currentUser: IUser;
  handlePin: (chatId: string) => void;
  notContactUser?: IUser;
  isForward?: boolean;
  forwardChat?: (chatId?: string) => void;
  forwardedChatIds?: string[];
};

const ChatItemContainer = (props: Props) => {
  const [chatUser, setChatUser] = useState('');

  const { chat, handleClickItem } = props;
  const [removeMutation] = useMutation(gql(mutations.chatRemove));
  const [markAsReadMutation] = useMutation(gql(mutations.chatMarkAsRead));
  const [chatAddMutation] = useMutation(gql(mutations.chatAdd));

  const getChatIdQuery = useQuery(gql(queries.getChatIdByUserIds), {
    variables: { userIds: chatUser },
    fetchPolicy: 'network-only',
    skip: !chatUser
  });

  if (getChatIdQuery.loading) {
    return null;
  }

  const remove = () => {
    confirm()
      .then(() => {
        removeMutation({
          variables: { id: chat._id },
          refetchQueries: [{ query: gql(queries.chats) }]
        }).catch((error) => {
          Alert.error(error.message);
        });
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const markAsRead = () => {
    markAsReadMutation({
      variables: { id: chat._id },
      refetchQueries: [{ query: gql(queries.chats) }]
    }).catch((error) => {
      Alert.error(error.message);
    });
  };

  const createChats = () => {
    if (handleClickItem) {
      const test = getChatIdQuery.data
        ? getChatIdQuery.data.getChatIdByUserIds
        : '';
      handleClickItem(test);
    }
  };

  const createChat = (userIds: string[]) => {
    chatAddMutation({
      variables: { type: 'direct', participantIds: userIds || [] },
      refetchQueries: [
        {
          query: gql(queries.chats)
        }
      ]
    })
      .then(({ data }) => {
        if (handleClickItem) {
          handleClickItem(data.chatAdd._id);
        }
        if (props.forwardChat) {
          props.forwardChat(data.chatAdd._id);
        }
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  return (
    <Component
      {...props}
      createChat={(userIds) => createChat(userIds)}
      remove={remove}
      markAsRead={markAsRead}
      forwardChat={props.forwardChat}
      createChats={createChats}
      setChatUser={setChatUser}
    />
  );
};

export default ChatItemContainer;
