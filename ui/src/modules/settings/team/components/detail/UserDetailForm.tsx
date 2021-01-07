import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import { IUser } from 'modules/auth/types';
import EmptyState from 'modules/common/components/EmptyState';
import Wrapper from 'modules/layout/components/Wrapper';
import { IChannel } from 'modules/settings/channels/types';
import { ISkillDocument } from 'modules/settings/skills/types';
import React from 'react';
import { IConversation } from '../../../../inbox/types';
import LeftSidebar from './LeftSidebar';

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
        contentType="user"
        showEmail={false}
      />

      <ActivityLogs
        target={user.details && user.details.fullName}
        contentId={user._id}
        contentType="user"
        extraTabs={[{ name: 'conversation', label: 'Conversations' }]}
      />
    </>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      leftSidebar={
        <LeftSidebar
          user={user}
          channels={channels}
          skills={skills}
          excludeUserSkill={excludeUserSkill}
          renderSkillForm={renderSkillForm}
          renderEditForm={renderEditForm}
        />
      }
      content={content}
      transparent={true}
    />
  );
}

export default UserDetails;
