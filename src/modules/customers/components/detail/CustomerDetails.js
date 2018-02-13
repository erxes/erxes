import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Wrapper } from 'modules/layout/components';
import {
  EmptyState,
  Icon,
  Tabs,
  TabTitle,
  DataWithLoader
} from 'modules/common/components';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { EditInformation } from 'modules/customers/containers';
import {
  ActivityList,
  InternalNotes,
  ConversationList
} from 'modules/activityLogs/components';
import { WhiteBoxRoot } from 'modules/layout/styles';
import { SubContent } from 'modules/customers/styles';

const propTypes = {
  customer: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  queryParams: PropTypes.object.isRequired,
  activityLogsCustomer: PropTypes.array.isRequired,
  loadingLogs: PropTypes.bool,
  history: PropTypes.object
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
    const { currentUser, activityLogsCustomer, loadingLogs } = this.props;

    if (currentTab === 'activity') {
      return (
        <DataWithLoader
          loading={loadingLogs}
          count={activityLogsCustomer.length}
          data={
            <ActivityList
              user={currentUser}
              activities={activityLogsCustomer}
            />
          }
          emptyText="No Activities"
          emptyImage="/images/robots/robot-03.svg"
        />
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
    const { customer, activityLogsCustomer, history } = this.props;
    const conversations = customer.conversations;

    return (
      <SubContent>
        {conversations.length ? (
          <ConversationList
            activityLog={activityLogsCustomer}
            detail={customer}
            history={history}
          />
        ) : (
          <EmptyState
            text="There aren’t any conversations."
            image="/images/robots/robot-02.svg"
            full
          />
        )}
      </SubContent>
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
        <WhiteBoxRoot>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="compose" /> New note
            </TabTitle>
          </Tabs>

          <NoteForm contentType="customer" contentTypeId={customer._id} />
        </WhiteBoxRoot>

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
        leftSidebar={<EditInformation customer={customer} />}
        content={content}
        transparent={true}
      />
    );
  }
}

CustomerDetails.propTypes = propTypes;

export default withRouter(CustomerDetails);
