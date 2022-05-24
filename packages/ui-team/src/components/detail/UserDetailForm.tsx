import ActivityInputs from '@erxes/ui/src/activityLogs/components/ActivityInputs';
import ActivityLogs from '@erxes/ui/src/activityLogs/containers/ActivityLogs';
import { IUser } from '@erxes/ui/src/auth/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IChannel } from '@erxes/ui-settings/src/channels/types';
import { ISkillDocument } from '@erxes/ui-settings/src/skills/types';
import React from 'react';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import LeftSidebar from './LeftSidebar';
import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';
import InfoSection from './InfoSection';
import LeadState from '@erxes/ui-contacts/src/customers/containers/LeadState';
import ActionSection from '../../containers/ActionSection';
import RightSidebar from './RightSidebar';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  user: IUser;
  channels: IChannel[];
  skills: ISkillDocument[];
  participatedConversations: IConversation[];
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

  const content = (
    <>
      <ActivityInputs
        contentTypeId={user._id}
        contentType="core:user"
        showEmail={false}
      />

      {isEnabled('logs') && (
        <ActivityLogs
          target={user.details && user.details.fullName}
          contentId={user._id}
          contentType="core:user"
          extraTabs={[{ name: 'conversation', label: 'Conversations' }]}
        />
      )}
    </>
  );

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
          <LeadState customer={user} />
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
      rightSidebar={<RightSidebar user={user} />}
      content={content}
      transparent={true}
    />
  );
}

export default UserDetails;
