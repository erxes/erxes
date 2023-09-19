import React from 'react';
// erxes
import Avatar from '../../../common/nameCard/Avatar';
import Icon from '../../../common/Icon';
import Button from '../../../common/Button';
import { IUser } from '../../../auth/types';
// local
import {
  ChatItemWrapper,
  ChatGroupAvatar,
  ChatWrapper,
  ChatActions,
  ChatActionItem,
  ContextMenuList,
  ContextMenuItem,
  AvatarImg
} from '../../styles';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '../../../common/DropdownToggle';
import { readFile } from '../../../utils';

type Props = {
  chat?: any;
  isWidget?: boolean;
  hasOptions?: boolean;
  handleClickItem?: (chatId: string) => void;
  remove?: () => void;
  markAsRead?: () => void;
  notContactUser?: IUser;
  currentUser: IUser;
  handlePin: (chatId: string) => void;
  isForward?: boolean;
  forwardChat?: (id?: string, type?: string) => void;
  createChats: () => void;
  setChatUser: (userId: string) => void;
};

const ChatItem = (props: Props) => {
  const {
    chat,
    notContactUser,
    currentUser,
    isForward,
    forwardChat,
    createChats,
    setChatUser
  } = props;

  const users: any[] = chat?.participantUsers || [];
  const user: any =
    users.length > 1
      ? users.filter((u) => u._id !== currentUser._id)[0]
      : users[0];

  const handleClick = () => {
    if (chat) {
      props.handleClickItem(chat._id);
    }
    if (notContactUser) {
      setChatUser(notContactUser._id);
      createChats();
    }
  };

  const renderInfo = () => {
    if (notContactUser) {
      return (
        <>
          <p>
            {(notContactUser && notContactUser.details?.fullName) ||
              notContactUser?.email ||
              null}
          </p>
          <span>{notContactUser?.details?.position}</span>
        </>
      );
    }

    return (
      <>
        <p>
          {chat && chat.type === 'direct'
            ? user?.details.fullName || user?.email
            : chat?.name}
        </p>
        <span>{chat && chat.type === 'direct' && user?.details.position}</span>
      </>
    );
  };

  const handleChatForward = () => {
    if (chat) {
      forwardChat(chat._id, 'group');
    }
    if (notContactUser) {
      forwardChat(notContactUser._id, 'direct');
    }
  };

  const renderChatActions = () => {
    if (isForward) {
      return (
        <Button
          btnStyle="simple"
          size="small"
          onClick={() => handleChatForward()}
        >
          Send
        </Button>
      );
    }

    return (
      chat && (
        <ChatActions>
          <Dropdown alignRight={true}>
            <Dropdown.Toggle as={DropdownToggle} id="comment-settings">
              <ChatActionItem>
                <Icon icon="ellipsis-h" size={14} />
              </ChatActionItem>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <ContextMenuList>
                <ContextMenuItem onClick={() => props.handlePin(chat._id)}>
                  {chat?.isPinned ? 'Unpin' : 'Pin'}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => props.markAsRead()}>
                  {chat && chat.isSeen ? 'Mark as unread' : 'Mark as read'}
                </ContextMenuItem>
                <ContextMenuItem color="red" onClick={() => props.remove()}>
                  Delete Chat
                </ContextMenuItem>
              </ContextMenuList>
            </Dropdown.Menu>
          </Dropdown>
        </ChatActions>
      )
    );
  };

  return (
    <ChatItemWrapper id="ChatItemWrapper" isWidget={true}>
      {chat &&
        (chat.type === 'direct' ? (
          <Avatar user={user} size={36} />
        ) : (
          <ChatGroupAvatar id="ChatGroupAvatar">
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
        ))}

      {notContactUser && <Avatar user={notContactUser} size={36} />}

      <ChatWrapper
        isSeen={
          notContactUser
            ? true
            : chat?.lastMessage?.createdUser?._id === currentUser?._id
            ? true
            : chat?.isSeen
        }
        onClick={handleClick}
      >
        {renderInfo()}
      </ChatWrapper>
      {renderChatActions()}
    </ChatItemWrapper>
  );
};

export default ChatItem;
