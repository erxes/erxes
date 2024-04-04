import { IUser } from '../../../auth/types';
import React, { useState } from 'react';
import { __ } from '../../../../utils';
import ChatItem from '../../containers/chat/ChatItem';
import ModalTrigger from '../../../common/ModalTrigger';
import Icon from '../../../common/Icon';
import FormControl from '../../../common/form/Control';
import CreateGroupChat from '../../containers/chat/CreateGroupChat';
import {
  IconButton,
  ChatListHeader,
  SearchInput,
  NoEvent,
  ChatListSpacing
} from '../../styles';
import Tip from '../../../common/Tip';
import { TabTitle, Tabs } from '../../../common/tabs';

type Props = {
  users: IUser[];
  chats: any[];
  currentUser: IUser;
  handleActive?: (chatId: string) => void;
  togglePinned: (chatId) => void;
  isForward?: boolean;
  forwardChat?: (id?: string, type?: string) => void;
};

export default function ChatList({
  users,
  chats,
  currentUser,
  handleActive,
  togglePinned,
  isForward,
  forwardChat
}: Props) {
  const contactedUsers = chats.map(
    (c) => c.type === 'direct' && c.participantUsers[0]?._id
  );

  const [searchValue, setSearchValue] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredGroupChat, setFilteredGroupChat] = useState([]);
  const [currentTab, setCurrentTab] = useState('Chats');
  const [pinnedChatIds, setPinnedChatIds] = useState(
    chats?.filter((chat: any) =>
      chat.isPinnedUserIds.includes(currentUser._id)
    ) || []
  );

  const updatePinned = (_chats: any[]) => {
    setPinnedChatIds(_chats);
  };

  const checkPinned = (_chatId: string) => {
    return pinnedChatIds.indexOf(_chatId) !== -1;
  };

  const handlePin = (_chatId: string) => {
    if (checkPinned(_chatId)) {
      updatePinned(pinnedChatIds.filter((c) => c !== _chatId));
      togglePinned(_chatId);
    } else {
      updatePinned([...pinnedChatIds, _chatId]);
      togglePinned(_chatId);
    }
  };

  const renderPinnedChats = (isGroup?: boolean) => {
    if (pinnedChatIds.length !== 0) {
      return (
        <>
          <label>Pinned</label>
          {chats.map(
            (c) =>
              c.isPinnedUserIds.includes(currentUser._id) &&
              (isGroup ? c.type === 'group' : c.type === 'direct') && (
                <ChatItem
                  key={c._id}
                  chat={c}
                  handlePin={handlePin}
                  currentUser={currentUser}
                  handleClickItem={() => handleActive(c._id)}
                  isForward={isForward}
                  forwardChat={forwardChat}
                />
              )
          )}
        </>
      );
    }

    return null;
  };

  const search = (e) => {
    const inputValue = e.target.value;

    setSearchValue(inputValue);
    setFilteredUsers(
      users.filter((item) => {
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
    setFilteredGroupChat(
      chats.filter((chat) => {
        if (chat.type === 'group') {
          return chat.name.toLowerCase().includes(inputValue.toLowerCase());
        }
      })
    );
  };

  const renderTabContent = () => {
    if (currentTab === 'Group chats') {
      return (
        <>
          {pinnedChatIds.length !== 0 && renderPinnedChats(true)}
          <ChatListHeader>
            {isForward ? (
              'Your groups'
            ) : (
              <>
                <ModalTrigger
                  title="Create a group chat"
                  trigger={<label>{__('Create a group chat')}</label>}
                  content={(props) => (
                    <CreateGroupChat
                      {...props}
                      handleClickItem={handleActive}
                    />
                  )}
                />
                <ModalTrigger
                  title="Create a group chat"
                  trigger={
                    <IconButton>
                      <Tip placement="top" text="Create group chat">
                        <Icon icon="users" size={15} />
                      </Tip>
                    </IconButton>
                  }
                  content={(props) => (
                    <CreateGroupChat
                      {...props}
                      handleClickItem={handleActive}
                    />
                  )}
                />
              </>
            )}
          </ChatListHeader>
          {chats.map((c) => {
            if (
              !c.isPinnedUserIds.includes(currentUser._id) &&
              c.type === 'group'
            ) {
              return (
                <ChatItem
                  chat={c}
                  currentUser={currentUser}
                  handleClickItem={() => handleActive(c._id)}
                  handlePin={handlePin}
                  isForward={isForward}
                  forwardChat={forwardChat}
                />
              );
            }
            return null;
          })}
        </>
      );
    }

    return (
      <>
        {pinnedChatIds.length !== 0 && renderPinnedChats(false)}
        <label>Recent</label>
        {chats.map((chat) => {
          if (
            !chat.isPinnedUserIds.includes(currentUser._id) &&
            chat.type === 'direct'
          ) {
            return (
              <ChatItem
                currentUser={currentUser}
                chat={chat}
                handleClickItem={() => handleActive(chat._id)}
                handlePin={handlePin}
                isForward={isForward}
                forwardChat={forwardChat}
              />
            );
          }

          return null;
        })}
        {users.map((user) => {
          if (!contactedUsers.includes(user._id)) {
            return (
              <ChatItem
                key={user._id}
                currentUser={currentUser}
                notContactUser={user}
                hasOptions={true}
                handleClickItem={handleActive}
                handlePin={handlePin}
                isForward={isForward}
                forwardChat={forwardChat}
              />
            );
          }

          return null;
        })}
      </>
    );
  };

  const renderUsers = () => {
    if (searchValue !== '') {
      if (filteredUsers.length > 0 || filteredGroupChat.length > 0) {
        return (
          <>
            {filteredGroupChat.map((groupChat) => (
              <ChatItem
                currentUser={currentUser}
                chat={groupChat}
                handleClickItem={() => handleActive(groupChat._id)}
                key={groupChat.name}
                handlePin={handlePin}
                isForward={isForward}
                forwardChat={forwardChat}
              />
            ))}
            {filteredUsers.map((user) => {
              if (!contactedUsers.includes(user._id)) {
                return (
                  <ChatItem
                    key={user._id}
                    currentUser={currentUser}
                    notContactUser={user}
                    hasOptions={true}
                    handleClickItem={handleActive}
                    handlePin={handlePin}
                    isForward={isForward}
                    forwardChat={forwardChat}
                  />
                );
              }

              return chats.map((chat) => {
                if (chat.participantUsers[0]._id === user._id) {
                  return (
                    <ChatItem
                      currentUser={currentUser}
                      chat={chat}
                      handleClickItem={() => handleActive(chat._id)}
                      handlePin={handlePin}
                      isForward={isForward}
                      forwardChat={forwardChat}
                    />
                  );
                }

                return null;
              });
            })}
          </>
        );
      }

      return (
        <NoEvent>
          <Icon icon="ban" size={33} />
          No matching members
        </NoEvent>
      );
    }

    return (
      <>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'Chats' ? 'active' : ''}
            onClick={() => setCurrentTab('Chats')}
          >
            {__('Chats')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'Group chats' ? 'active' : ''}
            onClick={() => setCurrentTab('Group chats')}
          >
            {__('Group chats')}
          </TabTitle>
        </Tabs>
        <ChatListSpacing>{renderTabContent()}</ChatListSpacing>
      </>
    );
  };

  return (
    <>
      <SearchInput>
        <Icon icon="search-1" size={18} />
        <FormControl
          placeholder={__('Search')}
          name="searchValue"
          onChange={search}
          value={searchValue}
          autoFocus={false}
        />
      </SearchInput>
      {renderUsers()}
    </>
  );
}
