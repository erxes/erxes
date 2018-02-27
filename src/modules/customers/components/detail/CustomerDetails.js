import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Wrapper } from 'modules/layout/components';
import {
  DataWithLoader,
  Tabs,
  TabTitle,
  Icon
} from 'modules/common/components';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { EditInformation } from 'modules/customers/containers';
import { ActivityList } from 'modules/activityLogs/components';
import { WhiteBoxRoot } from 'modules/layout/styles';
import { hasAnyActivity } from 'modules/customers/utils';

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
    const {
      currentUser,
      activityLogsCustomer,
      loadingLogs,
      customer
    } = this.props;

    return (
      <div
        style={
          !hasAnyActivity(activityLogsCustomer)
            ? { position: 'relative', height: '400px' }
            : {}
        }
      >
        <DataWithLoader
          loading={loadingLogs}
          count={
            !loadingLogs && hasAnyActivity(activityLogsCustomer) > 0 ? 1 : 0
          }
          data={
            <ActivityList
              user={currentUser}
              activities={activityLogsCustomer}
              target={customer}
              type={currentTab} //show logs filtered by type
            />
          }
          emptyText="No Activities"
          emptyImage="/images/robots/robot-03.svg"
        />
      </div>
    );
  }

  render() {
    const { currentTab } = this.state;
    const { customer } = this.props;
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Customers'), link: '/customers' },
      { title: customer.name || customer.email || 'N/A' }
    ];

    const content = (
      <div>
        <WhiteBoxRoot>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="compose" /> {__('New note')}
            </TabTitle>
          </Tabs>

          <NoteForm contentType="customer" contentTypeId={customer._id} />
        </WhiteBoxRoot>

        <Tabs grayBorder>
          <TabTitle
            className={currentTab === 'activity' ? 'active' : ''}
            onClick={() => this.onTabClick('activity')}
          >
            {__('Activity')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'notes' ? 'active' : ''}
            onClick={() => this.onTabClick('notes')}
          >
            {__('Notes')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'conversations' ? 'active' : ''}
            onClick={() => this.onTabClick('conversations')}
          >
            {__('Conversation')}
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
CustomerDetails.contextTypes = {
  __: PropTypes.func
};

export default withRouter(CustomerDetails);
