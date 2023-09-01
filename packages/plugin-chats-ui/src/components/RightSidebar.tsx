import React from 'react';
// erxes
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
// local
import ParticipantList from './participants/ParticipantList';
import UserDetails from './UserDetails';
import { SidebarWrapper, SidebarHeader, IconButton } from '../styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Icon from '@erxes/ui/src/components/Icon';
import GroupChatName from '../containers/modals/GroupChatName';

type Props = {
  chatDetail: any;
};

const RightSidebar = (props: Props) => {
  const { chatDetail } = props;

  const renderAction = () => {
    return (
      <div>
        <ModalTrigger
          title="Compose"
          trigger={
            <IconButton>
              <Icon icon="pencil" size={12} />
            </IconButton>
          }
          content={props => <GroupChatName {...props} chat={chatDetail} />}
          hideHeader={true}
          isAnimate={true}
        />
      </div>
    );
  };

  const renderGroup = () => (
    <SidebarWrapper>
      <SidebarHeader>
        <h3>{chatDetail.name}</h3>
        {renderAction()}
      </SidebarHeader>
      <ParticipantList chat={chatDetail} />
    </SidebarWrapper>
  );

  const renderDirect = () => (
    <SidebarWrapper>
      <UserDetails users={chatDetail.participantUsers || []} />
    </SidebarWrapper>
  );

  return (
    <Sidebar wide={true}>
      {chatDetail.type === 'group' ? renderGroup() : renderDirect()}
    </Sidebar>
  );
};

export default RightSidebar;
