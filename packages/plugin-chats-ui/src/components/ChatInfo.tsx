import React from 'react';
import { Link } from 'react-router-dom';
// erxes
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import CommonSidebar from '@erxes/ui/src/layout/components/Sidebar';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import {
  SidebarWrapper,
  SidebarHeader,
  ParticipantList,
  ParticipantItem,
  ParticipantItemPreview,
  Subtitle,
  DirectWrapper,
  DirectDetailItem
} from '../styles';

type Props = {
  chatDetail: any;
};

type FinalProps = {} & Props & { currentUser: IUser };

const ChatInfo = (props: FinalProps) => {
  const { chatDetail, currentUser } = props;

  const renderParticipants = (user: any) => {
    return (
      <li key={user._id}>
        <Link key={user._id} to={`/erxes-plugin-chat?userId=${user._id}`}>
          <Avatar user={user} size={36} />
          <ParticipantItem>
            {user.details.fullName || user.email}
            <br />
            <ParticipantItemPreview>
              {(chatDetail.createdUser && chatDetail.createdUser._id) ===
                user._id && 'Admin '}
              {(user.details.description && '- ' + user.details.description) ||
                ''}
            </ParticipantItemPreview>
          </ParticipantItem>
        </Link>
      </li>
    );
  };

  const renderDirect = () => {
    const users = chatDetail.participantUsers || [];

    const user =
      users.length > 1
        ? users.filter(u => u._id !== currentUser._id)[0]
        : users[0];

    return (
      <DirectWrapper>
        <Avatar user={user} size={64} />
        <h3>{user.details.fullName || user.email}</h3>
        <span>{user.details.description || ''}</span>
        <hr />
        <DirectDetailItem>
          <p>Description</p>
          <p>{user.details.description || ''}</p>
        </DirectDetailItem>
        <DirectDetailItem>
          <p>Email</p>
          <p>{user.email || ''}</p>
        </DirectDetailItem>
        <DirectDetailItem>
          <p>Phone</p>
          <p>{user.details.operatorPhone || ''}</p>
        </DirectDetailItem>
      </DirectWrapper>
    );
  };

  const renderGroup = () => {
    return (
      <>
        <SidebarHeader>
          <h3>{chatDetail.name}</h3>
        </SidebarHeader>
        <Subtitle>Participants</Subtitle>
        <ParticipantList>
          {(chatDetail.participantUsers || []).map(user =>
            renderParticipants(user)
          )}
        </ParticipantList>
      </>
    );
  };

  return (
    <CommonSidebar wide={true}>
      <SidebarWrapper>
        {chatDetail.type === 'group' ? renderGroup() : renderDirect()}
      </SidebarWrapper>
    </CommonSidebar>
  );
};

const WithCurrentUser = withCurrentUser(ChatInfo);

export default function(props: Props) {
  return <WithCurrentUser {...props} />;
}
