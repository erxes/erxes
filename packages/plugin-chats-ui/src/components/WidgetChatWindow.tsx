import React, { useState } from 'react';
// erxes
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import Icon from '@erxes/ui/src/components/Icon';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import MessageList from '../containers/messages/MessageList';
import Editor from '../containers/Editor';
import ReplyInfo from '../components/ReplyInfo';
import {
  ChatGroupAvatar,
  WidgetChatWindowWrapper,
  WidgetChatWindowHeader
} from '../styles';

type Props = {
  chat: any;
  sendMessage: (
    content: string,
    _attachments?: any[],
    replyId?: string
  ) => void;
  handleActive: (chatId: string, toClose: boolean) => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const WidgetChatWindow = (props: FinalProps) => {
  const { chat, currentUser } = props;
  const [reply, setReply] = useState<any>(null);

  const users: any[] = chat.participantUsers || [];
  const user: any =
    users.length > 1
      ? users.filter(u => u._id !== currentUser._id)[0]
      : users[0];

  const handleKeyDown = event => {
    if (event.keyCode === 27) {
      event.preventDefault();
      props.handleActive(chat._id, false);
    }
  };

  return (
    <WidgetChatWindowWrapper onKeyDown={handleKeyDown}>
      <WidgetChatWindowHeader>
        <div>
          {chat.type === 'direct' ? (
            <Avatar user={user} size={36} />
          ) : (
            <ChatGroupAvatar>
              <Avatar user={users[0]} size={24} />
              <Avatar user={users[1]} size={24} />
            </ChatGroupAvatar>
          )}
          <p>
            {chat.name || user.details?.fullName || user.email}
            <br />
            {chat.type === 'direct' && user.details?.position}
          </p>
        </div>
        <Icon
          icon="times"
          size={24}
          onClick={() => props.handleActive(chat._id, true)}
        />
      </WidgetChatWindowHeader>
      <MessageList
        chatId={chat._id}
        setReply={setReply}
        currentUser={currentUser}
        isWidget={true}
      />
      <ReplyInfo reply={reply} setReply={setReply} />
      <Editor
        chatId={chat._id}
        type="widget"
        setReply={setReply}
        reply={reply}
      />
    </WidgetChatWindowWrapper>
  );
};

const WithCurrentUser = withCurrentUser(WidgetChatWindow);

export default (props: Props) => <WithCurrentUser {...props} />;
