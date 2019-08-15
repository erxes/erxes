import dayjs from 'dayjs';
import ActivityInputs from 'modules/activityLogs/components/ActivityInputs';
import ActivityLogs from 'modules/activityLogs/containers/ActivityLogs';
import {
  ActivityDate,
  ActivityRow,
  AvatarWrapper,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { IUser } from 'modules/auth/types';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { renderFullName } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { IChannel } from 'modules/settings/channels/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { IConversation } from '../../../../inbox/types';
import LeftSidebar from './LeftSidebar';

type Props = {
  user: IUser;
  channels: IChannel[];
  participatedConversations: IConversation[];
  totalConversationCount: number;
  renderEditForm: (
    { closeModal, user }: { closeModal: () => void; user: IUser }
  ) => React.ReactNode;
};

class UserDetails extends React.Component<Props> {
  onTabClick = currentTab => {
    this.setState({ currentTab });
  };

  renderConversation(conversation, user) {
    const details = user.details || {};

    return (
      <ActivityRow key={conversation._id}>
        <React.Fragment>
          <FlexContent>
            <AvatarWrapper>
              <NameCard.Avatar user={user} size={50} />
            </AvatarWrapper>

            <FlexBody>
              <div>
                {details.fullName} participated in a
                <Link to={`/inbox?_id=${conversation._id}`}>
                  <strong> conversation </strong>
                </Link>
                with{' '}
                <Link
                  to={`/contacts/customers/details/${
                    conversation.customer._id
                  }`}
                >
                  <strong>{renderFullName(conversation.customer)}</strong>
                </Link>
              </div>
            </FlexBody>

            <Tip text={dayjs(conversation.createdAt).format('lll')}>
              <ActivityDate>
                {dayjs(conversation.createdAt).fromNow()}
              </ActivityDate>
            </Tip>
          </FlexContent>
        </React.Fragment>
      </ActivityRow>
    );
  }

  render() {
    const { user, channels, renderEditForm } = this.props;
    const { details = {} } = user;

    const title = details.fullName || 'Unknown';

    const breadcrumb = [{ title: 'Users', link: '/settings/team' }, { title }];

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
