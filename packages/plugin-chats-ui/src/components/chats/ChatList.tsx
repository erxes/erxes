import React, { useState } from 'react';
// erxes
import FormControl from '@erxes/ui/src/components/form/Control';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import ChatItem from '../../containers/chats/ChatItem';
import { Title, ChatListSearch, ChatListWrapper } from '../../styles';
import LoadMore from '@erxes/ui/src/components/LoadMore';
import { EmptyState } from '@erxes/ui/src/components';

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
  allUsers: IUser[];
  isForward?: boolean;
  forwardChat?: (chatId?: string, userIds?: string[]) => void;
  forwardedChatIds?: string[];
};

const ChatList = (props: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [pinnedChatIds, setPinnedChatIds] = useState(
    props.chats?.filter((chat: any) =>
      chat.isPinnedUserIds.includes(props.currentUser._id)
    ) || []
  );

  const {
    chats,
    currentUser,
    chatId,
    hasOptions,
    isWidget,
    togglePinned,
    totalCount,
    allUsers,
    isForward,
    forwardChat,
    forwardedChatIds
  } = props;

  const contactedUsers = chats.map(
    c => c.type === 'direct' && c.participantUsers[0]?._id
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
    togglePinned();
  };

  const checkPinned = (_chatId: string) => {
    return pinnedChatIds.indexOf(_chatId) !== -1;
  };

  const handleSearch = (event: any) => {
    setSearchValue(event.target.value);
    const inputValue = event.target.value;

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
          return (
            name.toLowerCase().includes(inputValue.toLowerCase()) ||
            user.details.position
              .toLowerCase()
              .includes(inputValue.toLowerCase())
          );
        } else {
          name = item.name;
          return name.toLowerCase().includes(inputValue.toLowerCase());
        }
      })
    );

    setFilteredUsers(
      allUsers.filter(item => {
        return (
          item.details?.fullName
            ?.toLowerCase()
            .includes(inputValue.toLowerCase()) ||
          item.username?.toLowerCase().includes(inputValue.toLowerCase()) ||
          item.email?.toLowerCase().includes(inputValue.toLowerCase()) ||
          item.details?.position
            ?.toLowerCase()
            .includes(inputValue.toLowerCase())
        );
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
                c.isPinnedUserIds.includes(props.currentUser._id) && (
                  <ChatItem
                    key={c._id}
                    chat={c}
                    active={c._id === chatId}
                    isPinned={c.isPinnedUserIds.includes(props.currentUser._id)}
                    isWidget={isWidget}
                    hasOptions={hasOptions}
                    handlePin={handlePin}
                    handleClickItem={props.handleClickItem}
                    isForward={isForward}
                    forwardChat={forwardChat}
                    forwardedChatIds={forwardedChatIds}
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
              !c.isPinnedUserIds.includes(props.currentUser._id) && (
                <ChatItem
                  key={c._id}
                  chat={c}
                  active={c._id === chatId}
                  isPinned={c.isPinnedUserIds.includes(props.currentUser._id)}
                  isWidget={isWidget}
                  hasOptions={hasOptions}
                  handlePin={handlePin}
                  handleClickItem={props.handleClickItem}
                  isForward={isForward}
                  forwardChat={forwardChat}
                  forwardedChatIds={forwardedChatIds}
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
        isPinned={c.isPinnedUserIds.includes(props.currentUser._id)}
        isWidget={isWidget}
        hasOptions={hasOptions}
        handlePin={handlePin}
        handleClickItem={props.handleClickItem}
        isForward={isForward}
        forwardChat={forwardChat}
        forwardedChatIds={forwardedChatIds}
      />
    ));
  };

  const renderFilteredUsers = () => {
    if (filteredUsers.length > 0) {
      return filteredUsers.map(user => {
        if (!contactedUsers.includes(user._id)) {
          return (
            <ChatItem
              key={user._id}
              currentUser={currentUser}
              notContactUser={user}
              hasOptions={true}
              handleClickItem={props.handleClickItem}
              handlePin={handlePin}
              isWidget={isWidget}
              active={false}
              isForward={isForward}
              forwardChat={forwardChat}
              forwardedChatIds={forwardedChatIds}
            />
          );
        }
      });
    }

    return <EmptyState icon="ban" text="No matching members" />;
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
        <>
          {renderFilteredChats()}
          {renderFilteredUsers()}
        </>
      )}
    </React.Fragment>
  );
};

export default ChatList;
