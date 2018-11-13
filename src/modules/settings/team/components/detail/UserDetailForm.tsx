import { ActivityList } from 'modules/activityLogs/components';
import {
  ActivityDate,
  ActivityRow,
  AvatarWrapper,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { IUser } from 'modules/auth/types';
import {
  DataWithLoader,
  Icon,
  LoadMore,
  NameCard,
  Tabs,
  TabTitle,
  Tip
} from 'modules/common/components';
import { ActivityContent } from 'modules/common/styles/main';
import { __, renderFullName } from 'modules/common/utils';
import { hasAnyActivity } from 'modules/customers/utils';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { Wrapper } from 'modules/layout/components';
import { WhiteBoxRoot } from 'modules/layout/styles';
import { IChannel } from 'modules/settings/channels/types';
import * as moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { IActivityLogForMonth } from '../../../../activityLogs/types';
import { IConversation } from '../../../../inbox/types';
import LeftSidebar from './LeftSidebar';

type Props = {
  user: IUser;
  channels: IChannel[];
  loadingLogs: boolean;
  activityLogsUser: IActivityLogForMonth[];
  participatedConversations: IConversation[];
  totalConversationCount: number;
  renderEditForm: (
    { closeModal, user }: { closeModal: () => void; user: IUser }
  ) => React.ReactNode;
};

type State = {
  currentTab: string;
};

class UserDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { currentTab: 'conversation' };
  }

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

  renderTabContent = () => {
    const { currentTab } = this.state;

    const {
      activityLogsUser,
      loadingLogs,
      user,
      participatedConversations,
      totalConversationCount
    } = this.props;

    const hasActivity = hasAnyActivity(activityLogsUser);

    if (currentTab === 'conversation') {
      return (
        <div>
          {participatedConversations.map(conversation => {
            return this.renderConversation(conversation, user);
          })}

          <LoadMore all={totalConversationCount} />
        </div>
      );
    }

    return (
      <ActivityContent isEmpty={!hasActivity}>
        <DataWithLoader
          loading={loadingLogs}
          count={!loadingLogs && hasActivity ? 1 : 0}
          data={
            <ActivityList
              user={user}
              activities={activityLogsUser}
              target={user.details && user.details.fullName}
              type={currentTab} // show logs filtered by type
            />
          }
          emptyText="Empty Notes"
          emptyImage="/images/robots/robot-03.svg"
        />
      </ActivityContent>
    );
  };

  render() {
    const { user, channels, renderEditForm } = this.props;
    const { currentTab } = this.state;
    const { details = {} } = user;

    const breadcrumb = [
      { title: 'Users', link: '/settings/team' },
      { title: details.fullName || 'N/A' }
    ];

    const conversationClick = () => this.onTabClick('conversation');
    const notesClick = () => this.onTabClick('notes');

    const content = (
      <div>
        <WhiteBoxRoot>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="edit-1" /> {__('New note')}
            </TabTitle>
          </Tabs>

          <NoteForm contentType="user" contentTypeId={user._id} />
        </WhiteBoxRoot>

        <Tabs grayBorder={true}>
          <TabTitle
            className={currentTab === 'conversation' ? 'active' : ''}
            onClick={conversationClick}
          >
            {__('Conversation')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'notes' ? 'active' : ''}
            onClick={notesClick}
          >
            {__('Notes')}
          </TabTitle>
        </Tabs>

        {this.renderTabContent()}
      </div>
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
