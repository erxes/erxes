import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// erxes
import Icon from '@erxes/ui/src/components/Icon';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
// local
import ChatList from '../containers/chats/ChatList';
import WidgetChatWindow from '../containers/WidgetChatWindow';
import {
  WidgetButton,
  WidgetPopoverWrapper,
  WidgetPopoverSeeAll,
  WidgetChatWrapper
} from '../styles';

const LOCALSTORAGE_KEY = 'erxes_active_chats';

const Widget = () => {
  const [activeChatIds, setActiveChatIds] = useState<any[]>(
    JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]')
  );

  const handleActive = (_chatId: string) => {
    if (checkActive(_chatId)) {
      updateActive(activeChatIds.filter(c => c !== _chatId));
    } else {
      updateActive([...activeChatIds, _chatId]);
    }
  };

  const updateActive = (_chats: any[]) => {
    setActiveChatIds(_chats);

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(_chats));
  };

  const checkActive = (_chatId: string) => {
    return activeChatIds.indexOf(_chatId) !== -1;
  };

  const popoverChat = (
    <Popover id="chat-popover" className="notification-popover">
      <WidgetPopoverWrapper>
        <ChatList isWidget handleClickItem={_chatId => handleActive(_chatId)} />
      </WidgetPopoverWrapper>
      <WidgetPopoverSeeAll>
        <Link to="/erxes-plugin-chat">See all</Link>
      </WidgetPopoverSeeAll>
    </Popover>
  );

  return (
    <>
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="bottom"
        overlay={popoverChat}
      >
        <WidgetButton>
          <Icon icon="chat-1" size={20} />
        </WidgetButton>
      </OverlayTrigger>
      <WidgetChatWrapper>
        {activeChatIds.map(c => (
          <WidgetChatWindow
            key={c._id}
            chatId={c}
            handleActive={handleActive}
          />
        ))}
      </WidgetChatWrapper>
    </>
  );
};

export default Widget;
