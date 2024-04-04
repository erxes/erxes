import React from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import Alert from '../../../utils/Alert';
// local
import Component from '../../components/chat/AddMember';
import { queries, mutations } from '../../graphql';

type Props = {
  chatId: string;
  closeModal: () => void;
  participantUserIds?: string[];
};

const AddMemberContainer = (props: Props) => {
  const { chatId } = props;
  const [memberMutation] = useMutation(gql(mutations.chatAddOrRemoveMember));

  const addOrRemoveMember = (userIds: string[]) => {
    if (userIds.length === 0) {
      return Alert.error('Select users!');
    }

    memberMutation({
      variables: { id: chatId, type: 'add', userIds },
      refetchQueries: [{ query: gql(queries.chats) }]
    })
      .then(() => {
        props.closeModal();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  return <Component {...props} addOrRemoveMember={addOrRemoveMember} />;
};

export default AddMemberContainer;
