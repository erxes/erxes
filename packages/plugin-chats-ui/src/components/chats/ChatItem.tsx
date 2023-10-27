import React, { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { convertFromHTML } from 'draft-js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { OverlayTrigger, Popover } from 'react-bootstrap';
// erxes
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import Icon from '@erxes/ui/src/components/Icon';
import Button from '@erxes/ui/src/components/Button';
import { IUser } from '@erxes/ui/src/auth/types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
// local
import {
  ChatItemWrapper,
  ChatGroupAvatar,
  ChatWrapper,
  ChatBody,
  ChatContent,
  ChatTimestamp,
  ChatActions,
  ChatActionItem,
  ContextMenuList,
  ContextMenuItem
} from '../../styles';

import * as router from '@erxes/ui/src/utils/router';

dayjs.extend(relativeTime);

type Props = {
  chat?: any;
  active?: boolean;
  isPinned?: boolean;
  isWidget?: boolean;
  handlePin: (chatId: string) => void;
  handleClickItem?: (chatId: string) => void;
  remove: () => void;
  markAsRead: () => void;
  notContactUser?: IUser;
  currentUser?: IUser;
  createChat?: (userIds: string[]) => void;
  isForward?: boolean;
  forwardChat?: (id: string, type: string) => void;
  forwardedChatIds?: string[];
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ChatItem = (props: FinalProps) => {
  const {
    chat,
    active,
    isPinned,
    isWidget,
    currentUser,
    notContactUser,
    createChat,
    isForward,
    forwardChat,
    forwardedChatIds
  } = props;
  const history = useHistory();

  const users: any[] = chat?.participantUsers || [];
  const user: any =
    users?.length > 1
      ? users?.filter(u => u._id !== currentUser._id)[0]
      : users?.[0];
  const draftContent: any =
    chat?.lastMessage && convertFromHTML(chat?.lastMessage.content);

  const handleClick = () => {
    if (chat) {
      if (props.handleClickItem) {
        props.handleClickItem(chat._id);
      } else {
        router.setParams(history, { id: chat._id });
      }
    }
    if (notContactUser) {
      createChat([notContactUser._id, currentUser._id]);
    }
  };

  const handleChatForward = () => {
    if (chat) {
      forwardChat(chat.type === 'group' ? chat._id : user._id, chat.type);
    } else {
      forwardChat(notContactUser._id, 'direct');
    }
  };

  const onDelete = () => {
    props.remove();
    document.getElementById('ChatActions').click();
  };

  const onPin = () => {
    props.handlePin(chat._id);
    document.getElementById('ChatActions').click();
  };

  const onMarkAsRead = () => {
    props.markAsRead();
    document.getElementById('ChatActions').click();
  };

  const popoverContextMenu = chat && (
    <Popover id="contextmenu-popover">
      <ContextMenuList>
        {!isWidget && (
          <ContextMenuItem onClick={onPin}>
            {isPinned ? 'Unpin' : 'Pin'}
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={onMarkAsRead}>
          {chat.isSeen ? 'Mark as unread' : 'Mark as read'}
        </ContextMenuItem>
        <ContextMenuItem color="red" onClick={onDelete}>
          Delete Chat
        </ContextMenuItem>
      </ContextMenuList>
    </Popover>
  );

  const renderChatActions = () => {
    if (isForward) {
      return (forwardedChatIds || []).includes(chat?._id) ||
        (forwardedChatIds || []).includes(user._id) ? (
        <Button btnStyle="link" disabled={true} size="small">
          Sent
        </Button>
      ) : (
        <Button
          btnStyle="simple"
          size="small"
          onClick={() => handleChatForward()}
        >
          Send
        </Button>
      );
    }

    if (chat) {
      return (
        <ChatActions id="ChatActions">
          <OverlayTrigger
            trigger="click"
            rootClose={true}
            placement="top"
            overlay={popoverContextMenu}
          >
            <ChatActionItem>
              <Icon icon="ellipsis-h" size={14} />
            </ChatActionItem>
          </OverlayTrigger>
        </ChatActions>
      );
    }

    return null;
  };

  const isSeen = chat
    ? chat.lastMessage?.createdUser?._id === currentUser?._id
      ? true
      : chat.isSeen
    : true;

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
          {chat && chat.type === 'direct' ? (
            <>
              {user?.details.fullName || user?.email}
              <span> ({user?.details.position})</span>
            </>
          ) : (
            chat?.name
          )}
        </p>
      </>
    );
  };

  return (
    <ChatItemWrapper
      active={active}
      isWidget={isWidget}
      isSeen={isSeen}
      onClick={!isWidget && handleClick}
    >
      {chat &&
        (chat.type === 'direct' ? (
          <Avatar user={user} size={36} />
        ) : (
          <ChatGroupAvatar>
            <Avatar user={users?.[0]} size={24} />
            <Avatar user={users?.[1]} size={24} />
          </ChatGroupAvatar>
        ))}

      {notContactUser && <Avatar user={notContactUser} size={36} />}

      <ChatWrapper isSeen={isSeen} onClick={isWidget && handleClick}>
        {renderInfo()}
        {chat && draftContent && (
          <ChatBody>
            <ChatContent
              dangerouslySetInnerHTML={{
                __html:
                  (draftContent && draftContent.contentBlocks?.[0]?.text) || ''
              }}
            />
            <ChatTimestamp>
              {chat.lastMessage &&
                chat.lastMessage.createdAt &&
                dayjs(chat.lastMessage.createdAt).fromNow()}
            </ChatTimestamp>
          </ChatBody>
        )}
      </ChatWrapper>
      {renderChatActions()}
    </ChatItemWrapper>
  );
};

const WithCurrentUser = withCurrentUser(ChatItem);

export default (props: Props) => <WithCurrentUser {...props} />;
