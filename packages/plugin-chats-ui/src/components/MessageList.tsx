import React from 'react';
import dayjs from 'dayjs';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import { MessageList, MessageListItem } from '../styles';

type Props = {
  messages: any[];
  currentUser: IUser;
};

function ChatMessageList(props: Props) {
  const { messages, currentUser } = props;

  const renderRow = (message: any) => {
    return (
      <MessageListItem
        key={message._id}
        me={message.createdUser._id === currentUser._id}
      >
        {message.content} <br />
        <b>{message.createdUser && message.createdUser.email}</b>
        <br />
        <span>{dayjs(message.createdAt).format('lll')}</span>
      </MessageListItem>
    );
  };

  return (
    <MessageList>{messages.map(message => renderRow(message))}</MessageList>
  );
}

export default ChatMessageList;
