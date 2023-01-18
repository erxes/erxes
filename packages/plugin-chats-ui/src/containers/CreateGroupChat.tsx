import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import { Alert } from '@erxes/ui/src/utils';
// local
import CreateGroupChat from '../components/CreateGroupChat';
import { mutations, queries } from '../graphql';

type Props = {
  closeModal: () => void;
};

const CreateGroupChatContainer = (props: Props) => {
  const [addChatMutation] = useMutation(gql(mutations.addChat));

  const startGroupChat = (name: string, userIds: string[]) => {
    if (!name) {
      return Alert.error('Name is required!');
    }

    if (userIds.length === 0) {
      return Alert.error('Select users!');
    }

    addChatMutation({
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

  return <CreateGroupChat {...props} startGroupChat={startGroupChat} />;
};

export default CreateGroupChatContainer;
