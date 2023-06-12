import React from 'react';
// erxes
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Icon from '@erxes/ui/src/components/Icon';
// local
import CreateDirectChat from './modals/CreateDirectChat';
import CreateGroupChat from '../containers/modals/CreateGroupChat';
import ChatList from '../containers/chats/ChatList';
import { SidebarWrapper, SidebarHeader, IconButton } from '../styles';

type Props = {
  chatId: string;
};

const LeftSidebar = (props: Props) => {
  const { chatId } = props;

  const renderActions = () => {
    return (
      <div>
        <ModalTrigger
          title="Compose"
          trigger={
            <IconButton>
              <Icon icon="pencil" size={12} />
            </IconButton>
          }
          content={props => <CreateDirectChat {...props} />}
          hideHeader
          isAnimate
        />
        <ModalTrigger
          title="Create a group chat"
          trigger={
            <IconButton>
              <Icon icon="users" size={12} />
            </IconButton>
          }
          content={props => <CreateGroupChat {...props} />}
          hideHeader
          isAnimate
        />
      </div>
    );
  };
  return (
    <Sidebar wide={true}>
      <SidebarWrapper>
        <SidebarHeader>
          <h3>Chats</h3>
          {renderActions()}
        </SidebarHeader>
        <ChatList chatId={chatId} hasOptions={true} isWidget={false} />
      </SidebarWrapper>
    </Sidebar>
  );
};

export default LeftSidebar;
