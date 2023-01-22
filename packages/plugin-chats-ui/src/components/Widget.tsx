import React from 'react';
import { Link } from 'react-router-dom';
// erxes
import Icon from '@erxes/ui/src/components/Icon';
import { OverlayTrigger, Popover } from 'react-bootstrap';
// local
import ChatList from './chats/ChatList';
import {
  NavButton,
  NavPopoverWrapper,
  NavPopoverSeeAll,
  TestElement
} from '../styles';

type Props = {
  chats: any;
};

const Widget = (props: Props) => {
  const { chats } = props;

  const popoverChat = (
    <Popover id="chat-popover">
      <Popover.Content>
        <NavPopoverWrapper>
          <ChatList chats={chats} />
        </NavPopoverWrapper>
        <NavPopoverSeeAll>
          <Link to="/erxes-plugin-chat">See all</Link>
        </NavPopoverSeeAll>
      </Popover.Content>
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
        <NavButton>
          <Icon icon="chat-1" size={20} />
        </NavButton>
      </OverlayTrigger>
      <TestElement>asd</TestElement>
    </>
  );
};

export default Widget;
