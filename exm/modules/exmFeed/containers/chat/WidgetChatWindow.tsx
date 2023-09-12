import React from 'react';
import { useQuery, useMutation } from "@apollo/client";
import gql from 'graphql-tag';
// erxes
import Alert from '../../../utils/Alert';
import Sidebar from '../../../layout/components/Sidebar';
import Spinner from '../../../../modules/common/Spinner';
// local
import Component from '../../components/chat/WidgetChatWindow';
import { queries, mutations } from '../../graphql';
import { IUser } from "../../../auth/types";

type Props = {
  chatId: string;
  currentUser: IUser;
  handleActive: (chatId: string) => void;
};

const WidgetChatWindowContainer = (props: Props) => {
  const { chatId, currentUser } = props;
  const chatDetailQuery = useQuery(gql(queries.chatDetail), {
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
      refetchQueries: [{ query: gql(queries.chats) }]
    }).catch(error => {
      Alert.error(error.message);
    });
  };

  if (chatDetailQuery.loading) {
    return (
      <Sidebar wide={true}>
        <Spinner />
      </Sidebar>
    );
  }

  if (chatDetailQuery.error) {
    return <p>{chatDetailQuery.error.message}</p>;
  }

  if (chatDetailQuery.data.chatDetail) {
    return (
      <Component
        chat={chatDetailQuery.data.chatDetail}
        sendMessage={sendMessage}
        handleActive={props.handleActive}
        currentUser={currentUser}
      />
    );
  }

  return <></>;
};

export default WidgetChatWindowContainer;
