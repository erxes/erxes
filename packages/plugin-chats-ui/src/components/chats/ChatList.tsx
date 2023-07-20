import React from 'react';
// erxes
import FormControl from '@erxes/ui/src/components/form/Control';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import ChatItem from '../../containers/chats/ChatItem';
import { Title, ChatListSearch, ChatListWrapper } from '../../styles';

type Props = {
  chats: any[];
  currentUser: IUser;
  chatId?: string;
  hasOptions?: boolean;
  isWidget?: boolean;
  handleClickItem?: (chatId: string) => void;
  togglePinned: () => void;
};

type State = {
  searchValue: string;
  filteredChats: any;
  pinnedChatIds: any;
};

class ChatList extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: '',
      filteredChats: [],
      pinnedChatIds:
        props.chats?.filter((chat: any) => chat.isPinned === true) || []
    };
  }

  render() {
    const {
      chats,
      currentUser,
      chatId,
      hasOptions,
      isWidget,
      togglePinned
    } = this.props;

    const handlePin = (_chatId: string) => {
      if (checkPinned(_chatId)) {
        updatePinned(this.state.pinnedChatIds.filter(c => c !== _chatId));
      } else {
        updatePinned([...this.state.pinnedChatIds, _chatId]);
      }
    };

    const updatePinned = (_chats: any[]) => {
      this.setState({ pinnedChatIds: _chats });
      togglePinned();
    };

    const checkPinned = (_chatId: string) => {
      return this.state.pinnedChatIds.indexOf(_chatId) !== -1;
    };

    const handleSearch = (event: any) => {
      this.setState({ searchValue: event.target.value });
      this.setState({
        filteredChats: chats.filter(item => {
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

          return name
            .toLowerCase()
            .includes(this.state.searchValue.toLowerCase());
        })
      });
    };

    const renderPinnedChats = () => {
      if (this.state.pinnedChatIds.length !== 0) {
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
                      handleClickItem={this.props.handleClickItem}
                    />
                  )
              )}
            </ChatListWrapper>
          </>
        );
      }
    };

    const renderChats = () =>
      this.state.pinnedChatIds.length !== chats.length && (
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
                    handleClickItem={this.props.handleClickItem}
                  />
                )
            )}
          </ChatListWrapper>
        </>
      );

    const renderFilteredChats = () => {
      return this.state.filteredChats.map(c => (
        <ChatItem
          key={c._id}
          chat={c}
          active={c._id === chatId}
          isPinned={c.isPinned}
          isWidget={isWidget}
          hasOptions={hasOptions}
          handlePin={handlePin}
          handleClickItem={this.props.handleClickItem}
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
        {this.state.searchValue.length === 0 ? (
          <>
            {renderPinnedChats()}
            {renderChats()}
          </>
        ) : (
          renderFilteredChats()
        )}
      </React.Fragment>
    );
  }
}

export default ChatList;
