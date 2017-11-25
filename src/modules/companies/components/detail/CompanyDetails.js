import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Wrapper } from 'modules/layout/components';
import { WhiteBox } from 'modules/layout/styles';
import {
  ConversationList,
  EmptyState,
  Tabs,
  TabTitle,
  Icon,
  Button,
  NameCard
} from 'modules/common/components';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import ActivityList from 'modules/activityLogs/components/ActivityList';
import {
  ActivityRow,
  AvatarWrapper,
  ActivityWrapper,
  ActivityCaption,
  ActivityContent,
  DeleteNote
} from 'modules/activityLogs/styles';
import LeftSidebar from './LeftSidebar';

const propTypes = {
  company: PropTypes.object.isRequired,
  customFields: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  queryParams: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  companyActivityLog: PropTypes.array.isRequired,
  activityLogRefetch: PropTypes.func.isRequired
};

class CompanyDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = { currentTab: 'activity' };

    this.onTabClick = this.onTabClick.bind(this);
  }

  onTabClick(currentTab) {
    this.setState({ currentTab });
  }

  renderTabContent() {
    const { currentTab } = this.state;
    const { currentUser, companyActivityLog } = this.props;

    if (currentTab === 'activity') {
      return (
        <ActivityList user={currentUser} activities={companyActivityLog} />
      );
    }

    if (currentTab === 'notes') {
      return this.renderInternalNotes();
    }

    if (currentTab === 'conversations') {
      return this.renderConversations();
    }
  }

  internalNoteRow(data, currentUser) {
    const { list } = data;

    return list.map(item => {
      if (item.action !== 'internal_note-create') return null;
      return (
        <ActivityRow key={item.id}>
          <ActivityWrapper>
            {item.by._id === currentUser._id ? (
              <DeleteNote>
                <Button btnStyle="danger" size="small">
                  <Icon icon="trash-a" />
                </Button>
              </DeleteNote>
            ) : null}

            <AvatarWrapper>
              <NameCard.Avatar user={item.createdUser} size={50} />
            </AvatarWrapper>
            <ActivityCaption>{item.by.details.fullName}</ActivityCaption>
            <div>{moment(item.createdAt).fromNow()}</div>
          </ActivityWrapper>

          <ActivityContent>{item.content}</ActivityContent>
        </ActivityRow>
      );
    });
  }

  renderInternalNotes() {
    const { companyActivityLog, currentUser } = this.props;

    return companyActivityLog.map(item =>
      this.internalNoteRow(item, currentUser)
    );
  }

  renderConversations() {
    const { currentUser } = this.props;
    const conversations = [];

    return (
      <WhiteBox>
        {conversations.length ? (
          <ConversationList conversations={conversations} user={currentUser} />
        ) : (
          <EmptyState
            text="There aren’t any conversations at the moment."
            icon="email"
          />
        )}
      </WhiteBox>
    );
  }

  render() {
    const { currentTab } = this.state;
    const { company } = this.props;

    const breadcrumb = [
      { title: 'Companies', link: '/companies' },
      { title: company.name || company.email || 'N/A' }
    ];

    const content = (
      <div>
        <WhiteBox>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="compose" /> New note
            </TabTitle>
          </Tabs>

          <NoteForm
            contentType="company"
            contentTypeId={company._id}
            refetch={this.props.activityLogRefetch}
          />
        </WhiteBox>

        <Tabs grayBorder>
          <TabTitle
            className={currentTab === 'activity' ? 'active' : ''}
            onClick={() => this.onTabClick('activity')}
          >
            Activity
          </TabTitle>
          <TabTitle
            className={currentTab === 'notes' ? 'active' : ''}
            onClick={() => this.onTabClick('notes')}
          >
            Notes
          </TabTitle>
          <TabTitle
            className={currentTab === 'conversations' ? 'active' : ''}
            onClick={() => this.onTabClick('conversations')}
          >
            Conversation
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

CompanyDetails.propTypes = propTypes;

export default CompanyDetails;
