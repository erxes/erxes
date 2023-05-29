import React from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import { Alert } from '@erxes/ui/src/utils';
// local
import Component from '../../components/modals/CreateGroupChat';
import { mutations, queries } from '../../graphql';

type Props = {
  closeModal: () => void;
};

const CreateGroupChatContainer = (props: Props) => {
  const [chatAddMutation] = useMutation(gql(mutations.chatAdd));

  const startGroupChat = (name: string, userIds: string[]) => {
    if (!name) {
      return Alert.error('Name is required!');
    }

    if (userIds.length === 0) {
      return Alert.error('Select users!');
    }

    chatAddMutation({
      variables: { name, type: 'group', participantIds: userIds || [] },
      refetchQueries: [
        {
          query: gql(queries.chats)
        }
      ]
    })
      .then(() => {
        props.closeModal();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  return <Component {...props} startGroupChat={startGroupChat} />;
};

export default CreateGroupChatContainer;
