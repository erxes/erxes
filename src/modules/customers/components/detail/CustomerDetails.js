import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { WhiteBox } from 'modules/layout/styles';
import {
  ConversationList,
  EmptyState,
  Icon,
  Tabs,
  TabTitle
} from 'modules/common/components';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { EditInformation } from 'modules/customers/containers';
import { ActivityList, InternalNotes } from 'modules/activityLogs/components';

const propTypes = {
  customer: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  queryParams: PropTypes.object.isRequired,
  activityLogsCustomer: PropTypes.array.isRequired
};

class CustomerDetails extends React.Component {
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
    const { currentUser, activityLogsCustomer } = this.props;

    if (currentTab === 'activity') {
      return (
        <ActivityList user={currentUser} activities={activityLogsCustomer} />
      );
    }

    if (currentTab === 'notes') {
      return <InternalNotes activityLog={activityLogsCustomer} />;
    }

    if (currentTab === 'conversations') {
      return this.renderConversations();
    }
  }

  renderConversations() {
    const { customer, currentUser } = this.props;
    const conversations = customer.conversations;

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
    const { customer } = this.props;

    const breadcrumb = [
      { title: 'Customers', link: '/customers' },
      { title: customer.name || customer.email || 'N/A' }
    ];

    const content = (
      <div>
        <WhiteBox>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="compose" /> New note
            </TabTitle>
          </Tabs>

          <NoteForm contentType="customer" contentTypeId={customer._id} />
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
    // onClick={() => this.onTabClick('conversations')}

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<EditInformation customer={customer} />}
        content={content}
        transparent={true}
      />
    );
  }
}

CustomerDetails.propTypes = propTypes;

export default CustomerDetails;
