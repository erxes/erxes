import React from 'react';
// erxes
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
// local
import ParticipantList from './participants/ParticipantList';
import UserDetails from './UserDetails';
import { SidebarWrapper, SidebarHeader } from '../styles';

type Props = {
  chatDetail: any;
};

const RightSidebar = (props: Props) => {
  const { chatDetail } = props;

  const renderGroup = () => (
    <SidebarWrapper>
      <SidebarHeader>
        <h3>{chatDetail.name}</h3>
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
