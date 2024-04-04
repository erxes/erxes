import React, { useEffect, useRef } from 'react';
// erxes
import Spinner from '../../../common/Spinner';
// local
import MessageItem from './MessageItem';
import { MessageListWrapper, MessageItemWrapper } from '../../styles';
import { IUser } from "../../../auth/types";

type Props = {
  messages: any[];
  latestMessages: any[];
  isAllMessages: boolean;
  setReply: (text: string) => void;
  loadEarlierMessage: () => void;
  currentUser: IUser;
  chatType?: string;
};

const MessageList = (props: Props) => {
  const { messages, latestMessages, isAllMessages, currentUser, chatType } = props;
  const messageListRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (messageListRef && messageListRef.current) {
      const element = messageListRef.current;

      if (element) {
        element.scrollTop = 0;
      }
    }
  }, [latestMessages]);

  const handleScroll = () => {
    if (messageListRef && messageListRef.current) {
      const element = messageListRef.current;

      if (element.scrollTop === element.clientHeight - element.scrollHeight) {
        props.loadEarlierMessage();
      }
    }
  };

  return (
    <MessageListWrapper innerRef={messageListRef} onScroll={handleScroll}>
      {latestMessages.map(m => (
        <MessageItem chatType={chatType} currentUser={currentUser} key={m._id} message={m} setReply={props.setReply} />
      ))}
      {messages.map(m => (
        <MessageItem chatType={chatType} currentUser={currentUser} key={m._id} message={m} setReply={props.setReply} />
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
