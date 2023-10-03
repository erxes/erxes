import React, { useState } from 'react';
// erxes
import Avatar from '../../../../modules/common/nameCard/Avatar';
import Icon from '../../../../modules/common/Icon';
import { IUser } from '../../../auth/types';
// local
import MessageList from '../../containers/chat/MessageList';
import Editor from '../../containers/chat/Editor';
import ReplyInfo from './ReplyInfo';
import {
  ChatGroupAvatar,
  WidgetChatWindowWrapper,
  WidgetChatWindowHeader,
  MinimizedWidgetChatWindow,
  AvatarImg
} from '../../styles';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import ParticipantList from './participants/ParticipantList';
import GroupChatAction from '../../containers/chat/GroupChatAction';
import { readFile } from '../../../utils';

type Props = {
  chat: any;
  sendMessage: (
    content: string,
    _attachments?: any[],
    replyId?: string
  ) => void;
  handleActive: (chatId: string) => void;
  currentUser: IUser;
};

const WidgetChatWindow = (props: Props) => {
  const { chat, currentUser } = props;
  const [reply, setReply] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const users: any[] = chat.participantUsers || [];
  const user: any =
    users.length > 1
      ? users.filter((u) => u._id !== currentUser._id)[0]
      : users[0];

  const handleKeyDown = (event) => {
    if (event.keyCode === 27) {
      event.preventDefault();
      props.handleActive(chat._id);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const popoverContent = (
    <Popover id="groupMembers-popover">
      <GroupChatAction chat={chat} />
      <ParticipantList chat={chat} />
    </Popover>
  );

  const showActiveChat = () => {
    if (isMinimized) {
      return (
        <MinimizedWidgetChatWindow onClick={() => handleMinimize()}>
          <WidgetChatWindowHeader>
            <div>
              {chat.type === 'direct' ? (
                <Avatar user={user} size={23} />
              ) : (
                <ChatGroupAvatar>
                  <Avatar user={users[0]} size={18} />
                  <Avatar user={users[1]} size={18} />
                </ChatGroupAvatar>
              )}
              <p>
                {chat.name || user.details?.fullName || user.email}
                {chat.type === 'direct' && (
                  <div className="position">{user.details?.position}</div>
                )}
              </p>
            </div>
            <div>
              <Icon icon="minus-1" size={20} onClick={() => handleMinimize()} />
              <Icon
                icon="times"
                size={24}
                onClick={() => props.handleActive(chat._id)}
              />
            </div>
          </WidgetChatWindowHeader>
        </MinimizedWidgetChatWindow>
      );
    }

    return (
      <WidgetChatWindowWrapper onKeyDown={handleKeyDown}>
        <WidgetChatWindowHeader>
          <div>
            {chat.type === 'direct' ? (
              <Avatar user={user} size={32} />
            ) : (
              <ChatGroupAvatar>
                {chat.featuredImage.length > 0 ? (
                  <AvatarImg
                    alt={'author'}
                    src={readFile(chat && chat.featuredImage[0].url, 60)}
                  />
                ) : (
                  <>
                    <Avatar user={users[0]} size={24} />
                    <Avatar user={users[1]} size={24} />{' '}
                  </>
                )}
              </ChatGroupAvatar>
            )}
            <p>
              <div className="name">
                {chat.name || user?.details?.fullName || user?.email}
              </div>
              {chat.type === 'direct' && (
                <div className="position">{user.details?.position}</div>
              )}
            </p>
            {chat.type === 'group' && (
              <OverlayTrigger
                trigger="click"
                rootClose={false}
                placement="bottom"
                overlay={popoverContent}
              >
                <Icon icon="downarrow-2" size={14} />
              </OverlayTrigger>
            )}
          </div>
          <div>
            <Icon icon="minus-1" size={24} onClick={() => handleMinimize()} />
            <Icon
              icon="times"
              size={24}
              onClick={() => props.handleActive(chat._id)}
            />
          </div>
        </WidgetChatWindowHeader>
        <MessageList
          currentUser={currentUser}
          chatId={chat._id}
          setReply={setReply}
          chatType={chat.type}
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

  return showActiveChat();
};

export default WidgetChatWindow;
