import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
// erxes
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import {
  ChatContentList,
  ChatContentItem,
  ChatContentDate,
  ChatContentBody
} from '../styles';

type Props = {
  messages: any[];
  currentUser: IUser;
};

const ChatHistory = (props: Props) => {
  dayjs.extend(relativeTime);
  dayjs.extend(calendar);
  const { messages, currentUser } = props;
  const sortedMessages = messages.sort((a, b) =>
    a.createdAt > b.createdAt ? 1 : -1
  );

  // auto scroll to bottom
  useEffect(() => {
    let chatcontentlistdiv: any = document.getElementById('chatcontentlist');
    chatcontentlistdiv.scrollTop = chatcontentlistdiv.scrollHeight;
  }, [props]);

  const renderRow = (message: any) => {
    return (
      <ChatContentItem
        key={message._id}
        me={message.createdUser._id === currentUser._id}
      >
        <div style={{ flex: 1 }} />
        <ChatContentDate>
          {message.createdAt && dayjs(message.createdAt).calendar()}
        </ChatContentDate>
        <ChatContentBody>{message.content || ''}</ChatContentBody>
        <Avatar
          user={
            message.createdUser._id === currentUser._id
              ? currentUser
              : message.createdUser
          }
          size={36}
        />
        <br />
      </ChatContentItem>
    );
  };

  return (
    <ChatContentList id="chatcontentlist">
      {sortedMessages.map(message => renderRow(message))}
    </ChatContentList>
  );
};

export default ChatHistory;
