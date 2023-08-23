import React from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import { Alert } from '@erxes/ui/src/utils';
// local
import Component from '../../components/modals/GroupChatName';
import { queries, mutations } from '../../graphql';

type Props = {
  chat: any;
  closeModal: () => void;
};

const GroupChatNameContainer = (props: Props) => {
  const [editMutation] = useMutation(gql(mutations.chatEdit));

  const edit = (id: string, groupChatName: string) => {
    editMutation({
      variables: {
        id,
        name: groupChatName
      },
      refetchQueries: [{ query: gql(queries.chats) }]
    })
      .then(() => {
        props.closeModal();
        Alert.success('You successfully updated an name');
      })
      .catch(err => {
        Alert.error(err.message);
      });
  };

  return <Component {...props} edit={edit} />;
};

export default GroupChatNameContainer;
