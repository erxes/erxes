import React from 'react';
import { Link } from 'react-router-dom';
// erxes
import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import CommonSidebar from '@erxes/ui/src/layout/components/Sidebar';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
// local
import AddMember from '../containers/AddMember';
import {
  SidebarWrapper,
  SidebarHeader,
  ParticipantList,
  ParticipantItem,
  ParticipantItemPreview,
  Subtitle,
  DirectWrapper,
  DirectDetailItem,
  OptionsWrapper,
  OptionsButton
} from '../styles';

type Props = {
  chatDetail: any;
  makeOrRemoveAdmin: (id: string) => void;
  addOrRemoveMember: (type: string, userIds: string[]) => void;
};

type FinalProps = {} & Props & { currentUser: IUser };

const ChatInfo = (props: FinalProps) => {
  const { chatDetail, currentUser } = props;

  const handleMouseOver = (id: string) => {
    let element: any = document.getElementById('option-' + id);

    if (element.style) {
      element.style.display = 'inline-block';
    }
  };

  const handleMouseLeave = (id: string) => {
    let element: any = document.getElementById('option-' + id);

    if (element.style) {
      element.style.display = 'none';
    }
  };

  const handleMakeOrRemoveAdmin = (id: string) => {
    props.makeOrRemoveAdmin(id);
  };

  const handleAddOrRemoveMember = (id: string) => {
    props.addOrRemoveMember('remove', [id]);
  };

  const renderParticipants = (user: any) => {
    return (
      <li
        key={user._id}
        onMouseOver={() => handleMouseOver(user._id)}
        onMouseLeave={() => handleMouseLeave(user._id)}
      >
        <Link to={`/erxes-plugin-chat?userId=${user._id}`}>
          <Avatar user={user} size={36} />
          <ParticipantItem>
            {user.details.fullName || user.email}
            <br />
            <ParticipantItemPreview>
              {user.isAdmin ? 'Admin ' : ''}
              {(user.details.description && '- ' + user.details.description) ||
                ''}
            </ParticipantItemPreview>
          </ParticipantItem>
        </Link>
        <OptionsWrapper id={'option-' + user._id}>
          {user.isAdmin ? (
            <Tip text="Remove as Admin" placement="bottom">
              <OptionsButton onClick={() => handleMakeOrRemoveAdmin(user._id)}>
                <Icon icon="shield-slash" size={14} />
              </OptionsButton>
            </Tip>
          ) : (
            <Tip text="Make admin" placement="bottom">
              <OptionsButton onClick={() => handleMakeOrRemoveAdmin(user._id)}>
                <Icon icon="shield" size={14} />
              </OptionsButton>
            </Tip>
          )}
          <Tip text="Remove user" placement="bottom">
            <OptionsButton onClick={() => handleAddOrRemoveMember(user._id)}>
              <Icon icon="removeuser" size={14} />
            </OptionsButton>
          </Tip>
        </OptionsWrapper>
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
          <ModalTrigger
            title="Add people"
            trigger={
              <li>
                <a href="#">
                  <Icon
                    icon="plus"
                    size={18}
                    color="black"
                    style={{ margin: '0 0.6em' }}
                  />
                  <ParticipantItem>Add people</ParticipantItem>
                </a>
              </li>
            }
            content={props => <AddMember {...props} chatId={chatDetail._id} />}
            hideHeader
            isAnimate
          />
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
