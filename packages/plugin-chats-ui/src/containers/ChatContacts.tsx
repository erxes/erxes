import React from 'react';
import { useQuery, useMutation, useSubscription } from 'react-apollo';
import gql from 'graphql-tag';
// erxes
import Alert from '@erxes/ui/src/utils/Alert';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import ChatContacts from '../components/ChatContacts';
import { queries, mutations, subscriptions } from '../graphql';

type Props = {
  currentUser: IUser;
};

const ChatContactsContainer = (props: Props) => {
  const { currentUser } = props;

  const [removeMutation] = useMutation(gql(mutations.removeChat));
  const [markAsReadMutation] = useMutation(gql(mutations.markAsReadChat));
  const chats = useQuery(gql(queries.chats));

  useSubscription(gql(subscriptions.chatInserted), {
    variables: { userId: currentUser._id },
    onSubscriptionData: () => {
      chats.refetch();
    }
  });

  const removeChat = (id: string) => {
    confirm()
      .then(() => {
        removeMutation({
          variables: { id }
        })
          .then(() => {
            chats.refetch();
          })
          .catch(error => {
            Alert.error(error.message);
          });
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const markChatAsRead = (id: string) => {
    markAsReadMutation({
      variables: { id }
    })
      .then(() => {
        chats.refetch();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  if (chats.loading) {
    return <p>...</p>;
  }

  if (chats.error) {
    return <p>{chats.error.message}</p>;
  }
  return (
    <ChatContacts
      chats={chats.data.chats.list}
      removeChat={removeChat}
      markChatAsRead={markChatAsRead}
    />
  );
};

export default withCurrentUser(ChatContactsContainer);
