import React from 'react';
import { useHistory } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import Alert from '@erxes/ui/src/utils/Alert';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import * as router from '@erxes/ui/src/utils/router';
// local
import Component from '../../components/chats/ChatItem';
import { queries, mutations } from '../../graphql';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  chat?: any;
  active?: boolean;
  isPinned?: boolean;
  isWidget?: boolean;
  hasOptions?: boolean;
  handlePin: (chatId: string) => void;
  handleClickItem?: (chatId: string) => void;
  currentUser?: IUser;
  notContactUser?: IUser;
  isForward?: boolean;
  forwardChat?: (chatId?: string, userIds?: string[]) => void;
  forwardedChatIds?: string[];
};

const ChatItemContainer = (props: Props) => {
  const { chat, active, handleClickItem, isWidget } = props;
  const history = useHistory();
  const [removeMutation] = useMutation(gql(mutations.chatRemove));
  const [markAsReadMutation] = useMutation(gql(mutations.chatMarkAsRead));
  const [chatAddMutation] = useMutation(gql(mutations.chatAdd));

  const remove = () => {
    confirm()
      .then(() => {
        removeMutation({
          variables: { id: chat._id },
          refetchQueries: [{ query: gql(queries.chats) }]
        })
          .then(() => {
            if (active) {
              router.removeParams(history, 'id', 'userId', 'userIds');
            }
          })
          .catch(error => {
            Alert.error(error.message);
          });
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const markAsRead = () => {
    markAsReadMutation({
      variables: { id: chat._id },
      refetchQueries: [{ query: gql(queries.chats) }]
    }).catch(error => {
      Alert.error(error.message);
    });
  };

  const createChat = (userIds: string[]) => {
    if (isWidget) {
      chatAddMutation({
        variables: { type: 'direct', participantIds: userIds || [] }
      })
        .then(({ data }) => {
          if (handleClickItem) {
            handleClickItem(data.chatAdd._id);
          }
          if (props.forwardChat) {
            props.forwardChat(data.chatAdd._id);
          }
        })
        .catch(error => {
          Alert.error(error.message);
        });
    } else {
      if (props.forwardChat) {
        props.forwardChat(null, userIds);
      } else {
        router.removeParams(history, 'id', 'userIds');
        router.setParams(history, { userId: userIds[0] });
      }
    }
  };

  return (
    <Component
      {...props}
      remove={remove}
      markAsRead={markAsRead}
      forwardChat={props.forwardChat}
      createChat={createChat}
    />
  );
};

export default ChatItemContainer;
