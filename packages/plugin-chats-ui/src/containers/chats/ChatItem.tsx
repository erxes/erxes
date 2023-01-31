import React from 'react';
import { useHistory } from 'react-router-dom';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import Alert from '@erxes/ui/src/utils/Alert';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import * as router from '@erxes/ui/src/utils/router';
// local
import Component from '../../components/chats/ChatItem';
import { queries, mutations } from '../../graphql';

type Props = {
  chat: any;
  active: boolean;
  isPinned: boolean;
  isWidget?: boolean;
  hasOptions?: boolean;
  handlePin: (chatId: string) => void;
  handleClickItem?: (chatId: string) => void;
};

const ChatItemContainer = (props: Props) => {
  const { chat, active } = props;
  const history = useHistory();
  const [removeMutation] = useMutation(gql(mutations.chatRemove));
  const [markAsReadMutation] = useMutation(gql(mutations.chatMarkAsRead));

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

  return <Component {...props} remove={remove} markAsRead={markAsRead} />;
};

export default ChatItemContainer;
