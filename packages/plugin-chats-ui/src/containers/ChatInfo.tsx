import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import Alert from '@erxes/ui/src/utils/Alert';
import Spinner from '@erxes/ui/src/components/Spinner';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
// local
import ChatInfo from '../components/ChatInfo';
import { queries, mutations } from '../graphql';

type Props = {
  chatId: string;
};

const ChatInfoContainer = (props: Props) => {
  const { chatId } = props;

  const [adminMutation] = useMutation(gql(mutations.makeOrRemoveAdminChat));
  const [memberMutation] = useMutation(gql(mutations.addOrRemoveMemberChat));

  const chatDetail = useQuery(gql(queries.chatDetail), {
    variables: { id: chatId }
  });

  const makeOrRemoveAdmin = (id: string) => {
    confirm()
      .then(() => {
        adminMutation({
          variables: { id: chatId, userId: id }
        })
          .then(() => {
            chatDetail.refetch();
          })
          .catch(error => {
            Alert.error(error.message);
          });
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const addOrRemoveMember = (type: string, userIds: string[]) => {
    confirm()
      .then(() => {
        memberMutation({
          variables: { id: chatId, type, userIds },
          refetchQueries: [{ query: gql(queries.chatDetail) }]
        })
          .then(() => {
            chatDetail.refetch();
          })
          .catch(error => {
            Alert.error(error.message);
          });
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  if (chatDetail.loading) {
    return <p>...</p>;
  }

  if (chatDetail.error) {
    return <p>{chatDetail.error.message}</p>;
  }

  if (chatDetail.data.chatDetail) {
    return (
      <ChatInfo
        chatDetail={chatDetail.data.chatDetail}
        makeOrRemoveAdmin={makeOrRemoveAdmin}
        addOrRemoveMember={addOrRemoveMember}
      />
    );
  }

  return <></>;
};

export default ChatInfoContainer;
