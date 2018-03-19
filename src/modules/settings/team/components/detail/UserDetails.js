import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { ActivityList } from 'modules/activityLogs/components';
import { Wrapper } from 'modules/layout/components';
import { WhiteBoxRoot } from 'modules/layout/styles';
import {
  NameCard,
  Tabs,
  TabTitle,
  Icon,
  DataWithLoader,
  LoadMore
} from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import {
  ActivityRow,
  ActivityWrapper,
  AvatarWrapper,
  ActivityCaption,
  ActivityDate
} from 'modules/activityLogs/styles';
import { hasAnyActivity } from 'modules/customers/utils';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import LeftSidebar from './LeftSidebar';

const propTypes = {
  user: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  saveProfile: PropTypes.func.isRequired,
  saveUser: PropTypes.func.isRequired,
  channels: PropTypes.array,
  loadingLogs: PropTypes.bool,
  activityLogsUser: PropTypes.array,
  totalConversationCount: PropTypes.number
};

class UserDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = { currentTab: 'conversation' };

    this.renderTabContent = this.renderTabContent.bind(this);
    this.onTabClick = this.onTabClick.bind(this);
  }

  onTabClick(currentTab) {
    this.setState({ currentTab });
  }

  renderConversation(conversation, user) {
    return (
      <ActivityRow key={conversation._id}>
        <ActivityWrapper>
          <AvatarWrapper>
            <NameCard.Avatar user={user} size={50} />
          </AvatarWrapper>

          <ActivityCaption>
            {user.details.fullName} participated in a
            <Link to={`/inbox?_id=${conversation._id}`}>
              <strong> conversation </strong>
            </Link>
            with{' '}
            <Link to={`/customers/details/${conversation.customer._id}`}>
              <strong>{renderFullName(conversation.customer)}</strong>
            </Link>
          </ActivityCaption>

          <ActivityDate>
            {moment(conversation.createdAt).fromNow()}
          </ActivityDate>
        </ActivityWrapper>
      </ActivityRow>
    );
  }

  renderTabContent() {
    const { currentTab } = this.state;
    const {
      currentUser,
      activityLogsUser,
      loadingLogs,
      user,
      totalConversationCount
    } = this.props;

    if (currentTab === 'conversation') {
      return (
        <div>
          {user.participatedConversations.map(conversation => {
            return this.renderConversation(conversation, user);
          })}

          <LoadMore all={totalConversationCount} />
        </div>
      );
    }

    return (
      <div
        style={
          !hasAnyActivity(activityLogsUser)
            ? { position: 'relative', height: '400px' }
            : {}
        }
      >
        <DataWithLoader
          loading={loadingLogs}
          count={!loadingLogs && hasAnyActivity(activityLogsUser) > 0 ? 1 : 0}
          data={
            <ActivityList
              user={currentUser}
              activities={activityLogsUser}
              target={user.details.fullName}
              type={currentTab} //show logs filtered by type
            />
          }
          emptyText="Empty Notes"
          emptyImage="/images/robots/robot-03.svg"
        />
      </div>
    );
  }

  render() {
    const { user } = this.props;
    const { currentTab } = this.state;
    const { __ } = this.context;
    const { details = {} } = user;

    const breadcrumb = [
      { title: 'Users', link: '/settings/team' },
      { title: details.fullName || 'N/A' }
    ];

    const content = (
      <div>
        <WhiteBoxRoot>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="compose" /> {__('New note')}
            </TabTitle>
          </Tabs>

          <NoteForm contentType="user" contentTypeId={user._id} />
        </WhiteBoxRoot>

        <Tabs grayBorder>
          <TabTitle
            className={currentTab === 'conversation' ? 'active' : ''}
            onClick={() => this.onTabClick('conversation')}
          >
            {__('Conversation')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'notes' ? 'active' : ''}
            onClick={() => this.onTabClick('notes')}
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
        leftSidebar={<LeftSidebar {...this.props} />}
        content={content}
        transparent={true}
      />
    );
  }
}

UserDetails.propTypes = propTypes;
UserDetails.contextTypes = {
  __: PropTypes.func,
  currentUser: PropTypes.object
};

export default UserDetails;
