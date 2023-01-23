import React, { useEffect, useRef } from 'react';
// erxes
import Spinner from '@erxes/ui/src/components/Spinner';
// local
import MessageItem from './MessageItem';
import { MessageListWrapper, MessageItemWrapper } from '../../styles';

type Props = {
  messages: any[];
  latestMessages: any[];
  isAllMessages: boolean;
  setReply: (text: string) => void;
  loadEarlierMessage: () => void;
};

const MessageList = (props: Props) => {
  const { messages, latestMessages, isAllMessages } = props;
  const messageListRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (messageListRef && messageListRef.current) {
      let element = messageListRef.current;

      if (element) {
        element.scrollTop = 0;
      }
    }
  }, [latestMessages]);

  const handleScroll = () => {
    if (messageListRef && messageListRef.current) {
      let element = messageListRef.current;

      if (element.scrollTop === element.clientHeight - element.scrollHeight) {
        props.loadEarlierMessage();
      }
    }
  };

  return (
    <MessageListWrapper innerRef={messageListRef} onScroll={handleScroll}>
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
