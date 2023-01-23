import React, { useState } from 'react';
// local
import ChatItem from '../../containers/chats/ChatItem';
import { Title, ChatListWrapper } from '../../styles';

type Props = {
  chats: any[];
  chatId?: string;
  hasOptions?: boolean;
  isWidget?: boolean;
  handleClickItem?: (chatId: string) => void;
};

const LOCALSTORAGE_KEY = 'erxes_pinned_chats';

const ChatList = (props: Props) => {
  const { chats, chatId, hasOptions, isWidget } = props;
  const [pinnedChatIds, setPinnedChatIds] = useState<any[]>(
    JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]')
  );

  const handlePin = (_chatId: string) => {
    if (checkPinned(_chatId)) {
      updatePinned(pinnedChatIds.filter(c => c !== _chatId));
    } else {
      updatePinned([...pinnedChatIds, _chatId]);
    }
  };

  const updatePinned = (_chats: any[]) => {
    setPinnedChatIds(_chats);

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(_chats));
  };

  const checkPinned = (_chatId: string) => {
    return pinnedChatIds.indexOf(_chatId) !== -1;
  };

  const renderPinnedChats = () => {
    if (pinnedChatIds.length !== 0) {
      return (
        <>
          <Title>Pinned</Title>
          <ChatListWrapper>
            {chats.map(
              c =>
                checkPinned(c._id) && (
                  <ChatItem
                    key={c._id}
                    chat={c}
                    active={c._id === chatId}
                    isPinned={true}
                    isWidget={isWidget}
                    hasOptions={hasOptions}
                    handlePin={handlePin}
                    handleClickItem={props.handleClickItem}
                  />
                )
            )}
          </ChatListWrapper>
        </>
      );
    }
  };

  const renderChats = () => (
    <>
      <Title>Recent</Title>
      <ChatListWrapper>
        {chats.map(
          c =>
            !checkPinned(c._id) && (
              <ChatItem
                key={c._id}
                chat={c}
                active={c._id === chatId}
                isPinned={false}
                isWidget={isWidget}
                hasOptions={hasOptions}
                handlePin={handlePin}
                handleClickItem={props.handleClickItem}
              />
            )
        )}
      </ChatListWrapper>
    </>
  );

  return (
    <React.Fragment>
      {renderPinnedChats()}
      {renderChats()}
    </React.Fragment>
  );
};

export default ChatList;
