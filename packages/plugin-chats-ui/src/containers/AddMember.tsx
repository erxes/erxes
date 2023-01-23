import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import { Alert } from '@erxes/ui/src/utils';
// local
import AddMember from '../components/AddMember';
import { queries, mutations } from '../graphql';

type Props = {
  chatId: string;
  closeModal: () => void;
};

const AddMemberContainer = (props: Props) => {
  const { chatId } = props;
  const [memberMutation] = useMutation(gql(mutations.addOrRemoveMemberChat));

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

  return <AddMember {...props} addOrRemoveMember={addOrRemoveMember} />;
};

export default AddMemberContainer;
