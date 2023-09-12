import React from 'react';
// erxes
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Icon from '@erxes/ui/src/components/Icon';
// local
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
          title="Create a chat"
          trigger={
            <IconButton>
              <Icon icon="edit-1" size={14} />
            </IconButton>
          }
          content={modalProps => <CreateGroupChat {...modalProps} />}
          isAnimate={true}
        />
      </div>
    );
  };
  return (
    <Sidebar wide={true} hasBorder={true}>
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
