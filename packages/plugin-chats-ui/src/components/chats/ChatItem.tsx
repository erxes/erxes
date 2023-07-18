import React, { useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { convertFromHTML } from 'draft-js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { OverlayTrigger, Popover } from 'react-bootstrap';
// erxes
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import Icon from '@erxes/ui/src/components/Icon';
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

dayjs.extend(relativeTime);

type Props = {
  chat: any;
  active: boolean;
  isPinned: boolean;
  isWidget?: boolean;
  hasOptions?: boolean;
  handlePin: (chatId: string) => void;
  handleClickItem?: (chatId: string) => void;
  remove: () => void;
  markAsRead: () => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ChatItem = (props: FinalProps) => {
  const { chat, active, isPinned, isWidget, hasOptions, currentUser } = props;
  const actionsRef = useRef<HTMLElement>(null);
  const history = useHistory();

  const users: any[] = chat.participantUsers || [];
  const user: any =
    users.length > 1
      ? users.filter(u => u._id !== currentUser._id)[0]
      : users[0];
  const draftContent: any =
    chat.lastMessage && convertFromHTML(chat.lastMessage.content);

  const handleMouseEnter = () => {
    if (actionsRef && actionsRef.current) {
      actionsRef.current.style.visibility = 'visible';
    }
  };

  const handleMouseLeave = () => {
    if (actionsRef && actionsRef.current) {
      actionsRef.current.style.visibility = 'hidden';
    }
  };

  const handleClick = () => {
    if (props.handleClickItem) {
      props.handleClickItem(chat._id);
    } else {
      history.push(`/erxes-plugin-chat?id=${chat._id}`);
    }
  };

  const popoverContextMenu = (
    <Popover id="contextmenu-popover">
      <ContextMenuList>
        <ContextMenuItem onClick={() => props.handlePin(chat._id)}>
          {isPinned ? 'Unpin' : 'Pin'}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => props.markAsRead()}>
          {chat.isSeen ? 'Mark as unread' : 'Mark as read'}
        </ContextMenuItem>
        <ContextMenuItem color="red" onClick={() => props.remove()}>
          Delete Chat
        </ContextMenuItem>
      </ContextMenuList>
    </Popover>
  );

  const isSeen =
    chat?.lastMessage?.createdUser?._id === currentUser?._id
      ? true
      : chat.isSeen;

  return (
    <ChatItemWrapper
      active={active}
      isWidget={isWidget}
      isSeen={isSeen}
      onClick={handleClick}
      onMouseEnter={() => hasOptions && handleMouseEnter()}
      onMouseLeave={() => hasOptions && handleMouseLeave()}
    >
      {chat.type === 'direct' ? (
        <Avatar user={user} size={36} />
      ) : (
        <ChatGroupAvatar>
          <Avatar user={users[0]} size={24} />
          <Avatar user={users[1]} size={24} />
        </ChatGroupAvatar>
      )}

      <ChatWrapper isSeen={isSeen}>
        <p>
          {chat.type === 'direct'
            ? user.details.fullName || user.email
            : chat.name}
        </p>
        <ChatBody>
          <ChatContent
            dangerouslySetInnerHTML={{
              __html:
                (draftContent && draftContent.contentBlocks?.[0]?.text) || ''
            }}
          ></ChatContent>
          <ChatTimestamp>
            {chat.lastMessage &&
              chat.lastMessage.createdAt &&
              dayjs(chat.lastMessage.createdAt).fromNow()}
          </ChatTimestamp>
        </ChatBody>
      </ChatWrapper>
      <ChatActions innerRef={actionsRef}>
        <OverlayTrigger
          trigger="click"
          rootClose={true}
          placement="bottom"
          overlay={popoverContextMenu}
        >
          <ChatActionItem>
            <Icon icon="ellipsis-h" size={14} />
          </ChatActionItem>
        </OverlayTrigger>
      </ChatActions>
    </ChatItemWrapper>
  );
};

const WithCurrentUser = withCurrentUser(ChatItem);

export default (props: Props) => <WithCurrentUser {...props} />;
