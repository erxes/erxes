import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import { IUser } from 'modules/auth/types';
import EmptyState from 'modules/common/components/EmptyState';
import Wrapper from 'modules/layout/components/Wrapper';
import { IChannel } from 'modules/settings/channels/types';
import React from 'react';
import { IConversation } from '../../../../inbox/types';
import LeftSidebar from './LeftSidebar';

type Props = {
  user: IUser;
  channels: IChannel[];
  participatedConversations: IConversation[];
  totalConversationCount: number;
  renderEditForm: ({
    closeModal,
    user
  }: {
    closeModal: () => void;
    user: IUser;
  }) => React.ReactNode;
};

class UserDetails extends React.Component<Props> {
  onTabClick = currentTab => {
    this.setState({ currentTab });
  };

  render() {
    const { user, channels, renderEditForm } = this.props;
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
            renderEditForm={renderEditForm}
          />
        }
        content={content}
        transparent={true}
      />
    );
  }
}

export default UserDetails;
