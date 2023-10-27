import React from 'react';
import { Link } from 'react-router-dom';
// erxes
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { OverlayTrigger, Popover } from 'react-bootstrap';
// local
import ChatList from '../containers/chats/ChatList';
import WidgetChatWindow from '../containers/WidgetChatWindow';
import {
  WidgetButton,
  WidgetPopoverWrapper,
  WidgetPopoverSeeAll,
  WidgetChatWrapper
} from '../styles';
import Label from '@erxes/ui/src/components/Label';
import { IUser } from '@erxes/ui/src/auth/types';
import { __, Alert } from '@erxes/ui/src/utils';

const LOCALSTORAGE_KEY = 'erxes_active_chats';
const LOCALSTORAGE_KEY_MINIMIZE = 'erxes_minimized_chats';

type Props = {
  unreadCount: number;
  currentUser: IUser;
};

type State = {
  activeChatIds: any[];
  minimizedChatIds: any[];
};

class Widget extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activeChatIds: JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY) || '[]'),
      minimizedChatIds: JSON.parse(
        localStorage.getItem(LOCALSTORAGE_KEY_MINIMIZE) || '[]'
      )
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.unreadCount - prevProps.unreadCount === 1) {
      Alert.success('You have a new chat');
    }
  }

  handleMinimize = (_chatId: string) => {
    const { minimizedChatIds } = this.state;

    if (minimizedChatIds.includes(_chatId)) {
      this.setState({
        minimizedChatIds: minimizedChatIds.filter(c => c !== _chatId)
      });
      localStorage.setItem(
        LOCALSTORAGE_KEY_MINIMIZE,
        JSON.stringify(minimizedChatIds.filter(c => c !== _chatId))
      );
    } else {
      this.setState({ minimizedChatIds: [...minimizedChatIds, _chatId] });
      localStorage.setItem(
        LOCALSTORAGE_KEY_MINIMIZE,
        JSON.stringify([...minimizedChatIds, _chatId])
      );
    }
  };

  handleActive = (_chatId: string, toClose?: boolean) => {
    const { activeChatIds } = this.state;

    if (this.checkActive(_chatId) && toClose) {
      this.updateActive(activeChatIds.filter(c => c !== _chatId));
    }
    if (this.checkActive(_chatId)) {
      return null;
    } else {
      this.updateActive([...activeChatIds, _chatId]);
    }
  };

  updateActive = (_chats: any[]) => {
    this.setState({ activeChatIds: _chats });

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(_chats));
  };

  checkActive = (_chatId: string) => {
    return this.state.activeChatIds.indexOf(_chatId) !== -1;
  };

  render() {
    const { unreadCount, currentUser } = this.props;
    const { activeChatIds, minimizedChatIds } = this.state;

    const popoverChat = (
      <Popover id="chat-popover" className="notification-popover">
        <WidgetPopoverWrapper>
          <ChatList
            isWidget={true}
            handleClickItem={_chatId => this.handleActive(_chatId)}
          />
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
            <Tip text={__('Chats')} placement="bottom">
              <Icon icon="chat-1" size={20} />
            </Tip>
            {unreadCount ? (
              <Label shake={true} lblStyle="danger" ignoreTrans={true}>
                {unreadCount}
              </Label>
            ) : (
              <></>
            )}
          </WidgetButton>
        </OverlayTrigger>
        <WidgetChatWrapper>
          {activeChatIds.map(c => (
            <WidgetChatWindow
              currentUser={currentUser}
              key={c._id}
              chatId={c}
              handleActive={this.handleActive}
              isMinimized={minimizedChatIds.includes(c)}
              handleMinimize={this.handleMinimize}
            />
          ))}
        </WidgetChatWrapper>
      </>
    );
  }
}

export default Widget;
