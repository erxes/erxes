import React, { useState } from 'react';
// erxes
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import Icon from '@erxes/ui/src/components/Icon';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import MessageList from '../containers/messages/MessageList';
import Editor from '../containers/Editor';
import ReplyInfo from '../components/ReplyInfo';
import {
  ChatGroupAvatar,
  WidgetChatWindowWrapper,
  WidgetChatWindowHeader,
  MinimizedWidgetChatWindow,
  MainPopoverWrapper,
  MembersPopoverWrapper
} from '../styles';
import Popover from 'react-bootstrap/Popover';
import ParticipantList from './participants/ParticipantList';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import GroupChatName from '../containers/modals/GroupChatName';

type Props = {
  chat: any;
  sendMessage: (
    content: string,
    _attachments?: any[],
    replyId?: string
  ) => void;
  handleActive: (chatId: string, toClose: boolean) => void;
  isMinimized?: boolean;
  handleMinimize?: (chatId: string) => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const WidgetChatWindow = (props: FinalProps) => {
  const { chat, currentUser, isMinimized, handleMinimize } = props;
  const [reply, setReply] = useState<any>(null);
  const [popoverContentType, setPopoverContentType] = useState('main');

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

  const popoverContent = () => {
    if (popoverContentType === 'members') {
      return (
        <Popover id="chatGroupMembers-popover">
          <MembersPopoverWrapper>
            <Button
              btnStyle="link"
              icon="arrow-left"
              onClick={() => setPopoverContentType('main')}
            >
              Back
            </Button>
            <ParticipantList type="widget" chat={chat} />
          </MembersPopoverWrapper>
        </Popover>
      );
    }
    if (popoverContentType === 'main') {
      return (
        <Popover id="chatGroupMembers-popover">
          <MainPopoverWrapper>
            <ModalTrigger
              title="Change group name"
              trigger={
                <div>
                  <Icon icon="pen-1" />
                  Change group name
                </div>
              }
              content={modalProps => (
                <GroupChatName {...modalProps} chat={chat} />
              )}
              isAnimate={true}
            />
            <div onClick={() => setPopoverContentType('members')}>
              <Icon icon="users" />
              See group members
            </div>
          </MainPopoverWrapper>
        </Popover>
      );
    }
  };

  if (isMinimized) {
    return (
      <MinimizedWidgetChatWindow onClick={() => handleMinimize(chat._id)}>
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
              <div className="name">
                {chat.name || user.details?.fullName || user.email}
              </div>
            </p>
          </div>
          <div>
            <Icon
              icon="minus-1"
              size={20}
              onClick={() => handleMinimize(chat._id)}
            />
            <Icon
              icon="times"
              size={24}
              onClick={() => props.handleActive(chat._id, true)}
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
              <Avatar user={users[0]} size={24} />
              <Avatar user={users[1]} size={24} />
            </ChatGroupAvatar>
          )}
          <p>
            <div className="name">
              {chat.name || user.details?.fullName || user.email}
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
              overlay={popoverContent()}
              onExit={() => setPopoverContentType('main')}
            >
              <Icon icon="downarrow-2" size={14} />
            </OverlayTrigger>
          )}
        </div>
        <div>
          <Icon
            icon="minus-1"
            size={24}
            onClick={() => handleMinimize(chat._id)}
          />
          <Icon
            icon="times"
            size={24}
            onClick={() => props.handleActive(chat._id, true)}
          />
        </div>
      </WidgetChatWindowHeader>
      <MessageList
        currentUser={currentUser}
        chatId={chat._id}
        setReply={setReply}
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
