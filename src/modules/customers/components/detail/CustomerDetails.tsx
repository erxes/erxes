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
import { MailForm } from 'modules/settings/integrations/containers/google';
import * as React from 'react';
import { IActivityLogForMonth } from '../../../activityLogs/types';
import { IUser } from '../../../auth/types';
import { TabContent } from '../../styles';
import { ICustomer } from '../../types';
import { hasAnyActivity } from '../../utils';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  customer: ICustomer;
  currentUser: IUser;
  activityLogsCustomer: IActivityLogForMonth[];
  taggerRefetchQueries?: any[];
  loadingLogs: boolean;
};

type State = {
  currentSubTab: string;
  currentTab: string;
};

class CustomerDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentSubTab: 'activity',
      currentTab: 'newNote'
    };
  }

  onTabClick = currentSubTab => {
    this.setState({ currentSubTab });
  };

  onChangeTab = currentTab => {
    this.setState({ currentTab });
  };

  renderSubTabContent() {
    const { currentSubTab } = this.state;

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
              type={currentSubTab} // show logs filtered by type
            />
          }
          emptyText="No Activities"
          emptyImage="/images/actions/19.svg"
        />
      </ActivityContent>
    );
  }

  renderTabContent() {
    const { customer } = this.props;
    const { currentTab } = this.state;

    if (currentTab === 'newNote') {
      return <NoteForm contentType="customer" contentTypeId={customer._id} />;
    }

    return (
      <TabContent>
        <MailForm
          contentType="customer"
          contentTypeId={customer._id}
          toEmail={customer.primaryEmail}
          refetchQueries={['activityLogsCustomer']}
        />
      </TabContent>
    );
  }

  render() {
    const { currentSubTab, currentTab } = this.state;
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
              className={currentTab === 'newNote' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'newNote')}
            >
              <Icon icon="edit-1" /> {__('New note')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'email' ? 'active' : ''}
              onClick={this.onChangeTab.bind(this, 'email')}
            >
              <Icon icon="email" /> {__('Email')}
            </TabTitle>
          </Tabs>

          {this.renderTabContent()}
        </WhiteBoxRoot>

        <Tabs grayBorder={true}>
          <TabTitle
            className={currentSubTab === 'activity' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'activity')}
          >
            {__('Activity')}
          </TabTitle>
          <TabTitle
            className={currentSubTab === 'notes' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'notes')}
          >
            {__('Notes')}
          </TabTitle>
          <TabTitle
            className={currentSubTab === 'conversations' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'conversations')}
          >
            {__('Conversation')}
          </TabTitle>
        </Tabs>

        {this.renderSubTabContent()}
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={
          <LeftSidebar
            wide={true}
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
