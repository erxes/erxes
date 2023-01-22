import React, { useEffect } from 'react';
// erxes
import { IUser } from '@erxes/ui/src/auth/types';
import Spinner from '@erxes/ui/src/components/Spinner';
// local
import MessageItem from './MessageItem';
import { MessageListWrapper, MessageItemWrapper } from '../../styles';

type Props = {
  messages: any[];
  latestMessages: any[];
  isAllMessages: boolean;
  currentUser: IUser;
  setReply: (text: string) => void;
  loadEarlierMessage: () => void;
};

const MessageList = (props: Props) => {
  const { messages, latestMessages, isAllMessages, currentUser } = props;

  useEffect(() => {
    let element: HTMLElement | null = document.getElementById('message-list');

    if (element) {
      element.scrollTop = 0;
    }
  }, [latestMessages]);

  const handleScroll = () => {
    const element: HTMLElement | null = document.getElementById('message-list');

    if (
      element &&
      element.scrollTop === element.clientHeight - element.scrollHeight
    ) {
      props.loadEarlierMessage();
    }
  };

  return (
    <MessageListWrapper id="message-list" onScroll={handleScroll}>
      {latestMessages.map(m => (
        <MessageItem key={m._id} message={m} setReply={props.setReply} />
      ))}
      {messages.map(m => (
        <MessageItem key={m._id} message={m} setReply={props.setReply} />
      ))}
      {!isAllMessages ? (
        <MessageItemWrapper>
          <Spinner />
        </MessageItemWrapper>
      ) : (
        ''
      )}
    </MessageListWrapper>
  );
};

export default MessageList;
