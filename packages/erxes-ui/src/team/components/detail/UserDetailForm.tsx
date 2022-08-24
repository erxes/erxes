import ActionSection from '../../containers/ActionSection';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IUser } from '@erxes/ui/src/auth/types';
import InfoSection from './InfoSection';
import LeftSidebar from './LeftSidebar';
import React from 'react';
import { UserHeader } from './styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';

type Props = {
  user: IUser;
  channels: any[]; // check - IChannel
  skills: any[]; // check - ISkillDocument
  participatedConversations: any[]; // check - IConversation
  totalConversationCount: number;
  excludeUserSkill: (skillId: string, userId: string) => void;
  renderSkillForm: ({
    closeModal,
    user
  }: {
    closeModal: () => void;
    user: IUser;
  }) => React.ReactNode;
  renderEditForm: ({
    closeModal,
    user
  }: {
    closeModal: () => void;
    user: IUser;
  }) => React.ReactNode;
};

function UserDetails({
  user,
  skills,
  channels,
  excludeUserSkill,
  renderSkillForm,
  renderEditForm
}: Props) {
  const { details = {} } = user;

  const title = details.fullName || 'Unknown';
  const breadcrumb = [{ title: 'Users', link: '/settings/team' }, { title }];

  if (!user._id) {
    return (
      <EmptyState
        image="/images/actions/11.svg"
        text="User not found"
        size="small"
      />
    );
  }

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      mainHead={
        <UserHeader>
          <InfoSection
            nameSize={16}
            avatarSize={60}
            user={user}
            renderEditForm={renderEditForm}
          >
            <ActionSection user={user} renderEditForm={renderEditForm} />
          </InfoSection>
          {loadDynamicComponent('contactDetailHeader', { customer: user })}
        </UserHeader>
      }
      leftSidebar={
        <LeftSidebar
          user={user}
          channels={channels}
          skills={skills}
          excludeUserSkill={excludeUserSkill}
          renderSkillForm={renderSkillForm}
        />
      }
      rightSidebar={loadDynamicComponent('contactDetailRightSidebar', { user })}
      content={loadDynamicComponent('contactDetailContent', { contact: user })}
      transparent={true}
    />
  );
}

export default UserDetails;
