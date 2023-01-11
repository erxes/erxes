import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
// erxes
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import Spinner from '@erxes/ui/src/components/Spinner';
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import {
  MessageList,
  MessageItem,
  MessageWrapper,
  MessageBody,
  MessageContent,
  MessageReply,
  MessageAction
} from '../styles';

type Props = {
  messages: any[];
  latestMessages: any[];
  currentUser: IUser;
  setReply: (text: string) => void;
  loadEarlierMessage: () => void;
};

const ChatHistory = (props: Props) => {
  dayjs.extend(relativeTime);
  dayjs.extend(calendar);
  const { messages, latestMessages, currentUser } = props;

  useEffect(() => {
    let element: HTMLElement | null = document.getElementById('message-list');

    if (element) {
      element.scrollTop = 0;
    }
  }, [latestMessages]);

  const handleMouseOver = (id: string) => {
    let element: HTMLElement | null = document.getElementById('action-' + id);

    if (element && element.style) {
      element.style.visibility = 'visible';
    }
  };

  const handleMouseLeave = (id: string) => {
    let element: HTMLElement | null = document.getElementById('action-' + id);

    if (element && element.style) {
      element.style.visibility = 'hidden';
    }
  };

  const handleScroll = () => {
    const element: HTMLElement | null = document.getElementById('message-list');

    if (
      element &&
      element.scrollTop === element.clientHeight - element.scrollHeight
    ) {
      props.loadEarlierMessage();
    }
  };

  const renderRow = (message: any) => {
    const isMe = message.createdUser._id === currentUser._id;

    return (
      <MessageItem
        key={message._id}
        me={isMe}
        onMouseOver={() => handleMouseOver(message._id)}
        onMouseLeave={() => handleMouseLeave(message._id)}
      >
        <div style={{ flex: 1 }} />
        <MessageWrapper me={isMe}>
          {message.relatedMessage && (
            <MessageReply>
              <b>
                {message.relatedMessage.createdUser &&
                  (message.relatedMessage.createdUser.details.fullName ||
                    message.relatedMessage.createdUser.email)}
                :&nbsp;
              </b>
              <div
                dangerouslySetInnerHTML={{
                  __html: message.relatedMessage.content
                }}
              />
            </MessageReply>
          )}
          <MessageBody me={isMe}>
            <Tip placement="top" text="Reply">
              <MessageAction
                onClick={() => props.setReply(message)}
                id={`action-${message._id}`}
              >
                <Icon icon="reply" color="secondary" />
              </MessageAction>
            </Tip>
            <Tip
              placement={isMe ? 'left' : 'right'}
              text={message.createdAt && dayjs(message.createdAt).calendar()}
            >
              <MessageContent
                dangerouslySetInnerHTML={{ __html: message.content || '' }}
              />
            </Tip>
          </MessageBody>
        </MessageWrapper>
        <Avatar user={isMe ? currentUser : message.createdUser} size={36} />
        <br />
      </MessageItem>
    );
  };

  return (
    <MessageList id="message-list" onScroll={handleScroll}>
      {latestMessages.map(message => renderRow(message))}
      {messages.map(message => renderRow(message))}
    </MessageList>
  );
};

export default ChatHistory;
