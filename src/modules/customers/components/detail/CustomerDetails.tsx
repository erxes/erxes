import { ActivityList } from 'modules/activityLogs/components';
import {
  DataWithLoader,
  Icon,
  Tabs,
  TabTitle
} from 'modules/common/components';
import { ActivityContent } from 'modules/common/styles/main';
import { __, renderFullName } from 'modules/common/utils';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { Wrapper } from 'modules/layout/components';
import { WhiteBoxRoot } from 'modules/layout/styles';
import * as React from 'react';
import { IUser } from '../../../auth/types';
import { MailForm } from '../../containers/common';
import { ICustomer } from '../../types';
import { hasAnyActivity } from '../../utils';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  customer: ICustomer;
  currentUser: IUser;
  activityLogsCustomer: any[];
  taggerRefetchQueries?: any[];
  loadingLogs: boolean;
};

type State = {
  currentTab: string;
  currentNoteTab: string;
}

class CustomerDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { currentTab: 'activity', currentNoteTab: 'newNote' };

    this.onTabClick = this.onTabClick.bind(this);
    this.onChangeTab = this.onChangeTab.bind(this);
  }

  onTabClick(currentTab) {
    this.setState({ currentTab });
  }

  onChangeTab(currentNoteTab) {
    this.setState({ currentNoteTab });
  }

  renderTabContent() {
    const { currentTab } = this.state;
 
    const {
      currentUser,
      activityLogsCustomer,
      loadingLogs,
      customer
    } = this.props;

    const hasActivity = hasAnyActivity(activityLogsCustomer);

    return (
      <ActivityContent isEmpty={!hasActivity}>
        <DataWithLoader
          loading={loadingLogs}
          count={!loadingLogs && hasActivity ? 1 : 0}
          data={
            <ActivityList
              user={currentUser}
              activities={activityLogsCustomer}
              target={customer.firstName}
              type={currentTab} // show logs filtered by type
            />
          }
          emptyText="No Activities"
          emptyImage="/images/robots/robot-03.svg"
        />
      </ActivityContent>
    );
  }

  renderHeaderTabContent() {
    const { customer } = this.props;
    const { currentNoteTab } = this.state;

    if(currentNoteTab === 'newNote') {
      return (
        <NoteForm contentType="customer" contentTypeId={customer._id} />
      );
    }

    return (
      <MailForm 
        contentType="customer" 
        contentTypeId={customer._id}
        customerEmail={customer.primaryEmail}
      />
    );
  }

  render() {
    const { currentTab, currentNoteTab } = this.state;
    const { customer, taggerRefetchQueries } = this.props;

    const breadcrumb = [
      { title: __('Customers'), link: '/customers' },
      { title: renderFullName(customer) }
    ];

    const content = (
      <div>
        <WhiteBoxRoot>
          <Tabs>
            <TabTitle 
              className={currentNoteTab === 'newNote' ? 'active' : ''}
              onClick={() => this.onChangeTab('newNote')}
            >
              <Icon icon="edit-1" /> {__('New note')}
            </TabTitle>
            <TabTitle
              className={currentNoteTab === 'email' ? 'active' : ''}
              onClick={() => this.onChangeTab('email')}
            >
              <Icon icon="email" /> {__('Email')}
            </TabTitle>
          </Tabs>
          
          {this.renderHeaderTabContent()}
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
        leftSidebar={
          <LeftSidebar
            wide
            customer={customer}
            taggerRefetchQueries={taggerRefetchQueries}
          />
        }
        rightSidebar={<RightSidebar customer={customer} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default CustomerDetails;
