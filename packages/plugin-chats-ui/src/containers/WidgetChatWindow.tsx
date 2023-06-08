import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
// erxes
import Alert from '@erxes/ui/src/utils/Alert';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Spinner from '@erxes/ui/src/components/Spinner';
// local
import Component from '../components/WidgetChatWindow';
import { queries, mutations } from '../graphql';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  chatId: string;
  currentUser: IUser;
  handleActive: (chatId: string, toClose: boolean) => void;
};

const WidgetChatWindowContainer = (props: Props) => {
  const { chatId, currentUser } = props;
  const { loading, error, data } = useQuery(gql(queries.chatDetail), {
    variables: { id: chatId }
  });
  const [addMutation] = useMutation(gql(mutations.chatMessageAdd));

  const sendMessage = (
    content: string,
    _attachments?: any[],
    replyId?: string
  ) => {
    if (!content) {
      return;
    }

    const relatedId = replyId || null;
    const attachments = _attachments || null;

    addMutation({
      variables: { content, chatId, relatedId, attachments },
      refetchQueries: [
        { query: gql(queries.chats) },
        {
          query: gql(queries.getUnreadChatCount),
          variables: { userId: currentUser._id }
        }
      ]
    }).catch(err => {
      Alert.error(err.message);
    });
  };

  if (loading) {
    return (
      <Sidebar wide={true}>
        <Spinner />
      </Sidebar>
    );
  }

  if (error) {
    Alert.error(error.message);
  }

  if (data.chatDetail) {
    return (
      <Component
        chat={data.chatDetail}
        sendMessage={sendMessage}
        handleActive={props.handleActive}
      />
    );
  }

  return <></>;
};

export default WidgetChatWindowContainer;
