import React, { useEffect, useState } from 'react';
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
  forwardChat?: (id?: string, type?: string) => void;
};

const ChatItemContainer = (props: Props) => {
  const [chatUser, setChatUser] = useState('');
  const [chatId, setChatId] = useState(undefined);

  const { chat, handleClickItem } = props;
  const [removeMutation] = useMutation(gql(mutations.chatRemove));
  const [markAsReadMutation] = useMutation(gql(mutations.chatMarkAsRead));

  const getChatIdQuery = useQuery(gql(queries.getChatIdByUserIds), {
    variables: { userIds: chatUser },
    fetchPolicy: 'network-only',
    skip: !chatUser
  });

  useEffect(() => {
    setChatId(getChatIdQuery.data);
  }, [getChatIdQuery.data]);

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
    if (chatId) {
      handleClickItem(chatId.getChatIdByUserIds);
    }
  };

  return (
    <Component
      {...props}
      remove={remove}
      markAsRead={markAsRead}
      forwardChat={props.forwardChat}
      createChats={createChats}
      setChatUser={setChatUser}
    />
  );
};

export default ChatItemContainer;
