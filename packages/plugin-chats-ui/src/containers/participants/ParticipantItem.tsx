import React from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import Alert from '@erxes/ui/src/utils/Alert';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
// local
import Component from '../../components/participants/ParticipantItem';
import { queries, mutations } from '../../graphql';

type Props = {
  user: any;
  chatId: string;
  isAdmin: boolean;
};

const ParticipantItemContainer = (props: Props) => {
  const { user, chatId, isAdmin } = props;
  const [adminMutation] = useMutation(gql(mutations.chatMakeOrRemoveAdmin));
  const [memberMutation] = useMutation(gql(mutations.chatAddOrRemoveMember));

  const makeOrRemoveAdmin = () => {
    confirm()
      .then(() => {
        adminMutation({
          variables: { id: chatId, userId: user._id },
          refetchQueries: [
            { query: gql(queries.chatDetail), variables: { id: chatId } },
            { query: gql(queries.chats) }
          ]
        }).catch(error => {
          Alert.error(error.message);
        });
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };
  const addOrRemoveMember = () => {
    confirm()
      .then(() => {
        memberMutation({
          variables: { id: chatId, type: 'remove', userIds: [user._id] },
          refetchQueries: [
            {
              query: gql(queries.chatDetail),
              variables: { id: chatId }
            },
            { query: gql(queries.chats) }
          ]
        }).catch(error => {
          Alert.error(error.message);
        });
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  return (
    <Component
      user={user}
      makeOrRemoveAdmin={makeOrRemoveAdmin}
      addOrRemoveMember={addOrRemoveMember}
      isAdmin={isAdmin}
    />
  );
};

export default ParticipantItemContainer;
