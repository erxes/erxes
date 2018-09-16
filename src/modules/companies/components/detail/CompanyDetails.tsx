import { ActivityList } from 'modules/activityLogs/components';
import { IUser } from 'modules/auth/types';
import {
  DataWithLoader,
  Icon,
  Tabs,
  TabTitle
} from 'modules/common/components';
import { ActivityContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { hasAnyActivity } from 'modules/customers/utils';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { Wrapper } from 'modules/layout/components';
import { WhiteBox } from 'modules/layout/styles';
import * as React from 'react';
import { withRouter } from 'react-router';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

type Props = {
  company: ICompany,
  currentUser: IUser,
  companyActivityLog: any[],
  taggerRefetchQueries?: any[],
  loadingLogs: boolean,
};

type State = {
  currentTab: string
};

class CompanyDetails extends React.Component<Props, State> {
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
      companyActivityLog,
      company,
      loadingLogs
    } = this.props;

    const hasActivity = hasAnyActivity(companyActivityLog);

    return (
      <ActivityContent isEmpty={!hasActivity}>
        <DataWithLoader
          loading={loadingLogs}
          count={!loadingLogs && hasActivity ? 1 : 0}
          data={
            <ActivityList
              user={currentUser}
              activities={companyActivityLog}
              target={company.primaryName}
              type={currentTab}
            />
          }
          emptyText="No Activities"
          emptyImage="/images/robots/robot-03.svg"
        />
      </ActivityContent>
    );
  }

  render() {
    const { currentTab } = this.state;
    const { company, taggerRefetchQueries } = this.props;

    const breadcrumb = [
      { title: __('Companies'), link: '/companies' },
      { title: company.primaryName || company.email || 'N/A' }
    ];

    const content = (
      <div>
        <WhiteBox>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="edit-1" /> {__('New note')}
            </TabTitle>
          </Tabs>

          <NoteForm contentType="company" contentTypeId={company._id} />
        </WhiteBox>

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
            {...this.props}
            taggerRefetchQueries={taggerRefetchQueries}
          />
        }
        rightSidebar={<RightSidebar company={company} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default withRouter(CompanyDetails);
