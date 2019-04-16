import { ActivityInputs } from 'modules/activityLogs/components';
import { ActivityLogs } from 'modules/activityLogs/containers';
import {
  ActivityDate,
  ActivityRow,
  AvatarWrapper,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { IUser } from 'modules/auth/types';
import { NameCard, Tip } from 'modules/common/components';
import { __, renderFullName } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { IChannel } from 'modules/settings/channels/types';
import * as moment from 'moment';
import * as React from 'react';
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
                <Link to={`/customers/details/${conversation.customer._id}`}>
                  <strong>{renderFullName(conversation.customer)}</strong>
                </Link>
              </div>
            </FlexBody>

            <Tip text={moment(conversation.createdAt).format('lll')}>
              <ActivityDate>
                {moment(conversation.createdAt).fromNow()}
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

    const breadcrumb = [
      { title: 'Users', link: '/settings/team' },
      { title: details.fullName || 'N/A' }
    ];

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
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
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
