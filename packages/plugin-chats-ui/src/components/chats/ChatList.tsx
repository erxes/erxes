import React, { useState } from 'react';
// erxes
import FormControl from '@erxes/ui/src/components/form/Control';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import ChatItem from '../../containers/chats/ChatItem';
import { Title, ChatListSearch, ChatListWrapper } from '../../styles';
import LoadMore from '@erxes/ui/src/components/LoadMore';

type Props = {
  chats: any[];
  currentUser: IUser;
  chatId?: string;
  hasOptions?: boolean;
  isWidget?: boolean;
  handleClickItem?: (chatId: string) => void;
  togglePinned: () => void;
  loadEarlierChat: () => void;
  loading?: boolean;
  totalCount?: number;
};

const ChatList = (props: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [pinnedChatIds, setPinnedChatIds] = useState(
    props.chats?.filter((chat: any) => chat.isPinned === true) || []
  );

  const {
    chats,
    currentUser,
    chatId,
    hasOptions,
    isWidget,
    togglePinned,
    totalCount
  } = props;

  const handlePin = (_chatId: string) => {
    if (checkPinned(_chatId)) {
      updatePinned(pinnedChatIds.filter(c => c !== _chatId));
    } else {
      updatePinned([...pinnedChatIds, _chatId]);
    }
  };

  const updatePinned = (_chats: any[]) => {
    setPinnedChatIds(_chats);
    togglePinned();
  };

  const checkPinned = (_chatId: string) => {
    return pinnedChatIds.indexOf(_chatId) !== -1;
  };

  const handleSearch = (event: any) => {
    setSearchValue(event.target.value);

    setFilteredChats(
      chats.filter(item => {
        let name = '';

        if (item.type === 'direct') {
          const users: any[] = item.participantUsers || [];
          const user: any =
            users.length > 1
              ? users.filter(u => u._id !== currentUser._id)[0]
              : users[0];
          name = user.details.fullName || user.email;
        } else {
          name = item.name;
        }

        return name.toLowerCase().includes(searchValue.toLowerCase());
      })
    );
  };

  const renderPinnedChats = () => {
    if (pinnedChatIds.length !== 0) {
      return (
        <>
          <Title>Pinned</Title>
          <ChatListWrapper>
            {chats.map(
              c =>
                c.isPinned && (
                  <ChatItem
                    key={c._id}
                    chat={c}
                    active={c._id === chatId}
                    isPinned={c.isPinned}
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

  const renderChats = () =>
    pinnedChatIds.length !== chats.length && (
      <>
        <Title>Recent</Title>
        <ChatListWrapper>
          {chats.map(
            c =>
              !c.isPinned && (
                <ChatItem
                  key={c._id}
                  chat={c}
                  active={c._id === chatId}
                  isPinned={c.isPinned}
                  isWidget={isWidget}
                  hasOptions={hasOptions}
                  handlePin={handlePin}
                  handleClickItem={props.handleClickItem}
                />
              )
          )}
          <LoadMore all={totalCount} perPage={10} loading={false} />
        </ChatListWrapper>
      </>
    );

  const renderFilteredChats = () => {
    return filteredChats.map(c => (
      <ChatItem
        key={c._id}
        chat={c}
        active={c._id === chatId}
        isPinned={c.isPinned}
        isWidget={isWidget}
        hasOptions={hasOptions}
        handlePin={handlePin}
        handleClickItem={props.handleClickItem}
      />
    ));
  };

  return (
    <React.Fragment>
      <ChatListSearch>
        <FormControl
          type="text"
          placeholder="Search Chat"
          round={true}
          onChange={handleSearch}
        />
      </ChatListSearch>
      {searchValue.length === 0 ? (
        <>
          {renderPinnedChats()}
          {renderChats()}
        </>
      ) : (
        renderFilteredChats()
      )}
    </React.Fragment>
  );
};

export default ChatList;
