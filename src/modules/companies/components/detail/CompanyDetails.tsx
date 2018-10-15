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
import { ICompany, ICompanyActivityLog } from 'modules/companies/types';
import { hasAnyActivity } from 'modules/customers/utils';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { Wrapper } from 'modules/layout/components';
import { WhiteBox } from 'modules/layout/styles';
import { MailForm } from 'modules/settings/integrations/containers/google';
import * as React from 'react';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../../common/types';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

interface IProps extends IRouterProps {
  company: ICompany;
  currentUser: IUser;
  companyActivityLog: ICompanyActivityLog[];
  taggerRefetchQueries?: any[];
  loadingLogs: boolean;
}

type State = {
  currentTab: string;
  currentSubtab: string;
  attachmentPreview: any;
};

class CompanyDetails extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentSubtab: 'activity',
      currentTab: 'newNote',
      attachmentPreview: null
    };
  }

  onTabClick = currentSubtab => {
    this.setState({ currentSubtab });
  };

  onChangeTab = currentTab => {
    this.setState({ currentTab });
  };

  setAttachmentPreview = attachmentPreview => {
    this.setState({ attachmentPreview });
  };

  renderSubTabContent() {
    const { currentSubtab } = this.state;

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
              target={company.primaryName || ''}
              type={currentSubtab}
            />
          }
          emptyText="No Activities"
          emptyImage="/images/robots/robot-03.svg"
        />
      </ActivityContent>
    );
  }

  renderTabContent() {
    const { company } = this.props;
    const { currentTab } = this.state;

    if (currentTab === 'newNote') {
      return <NoteForm contentType="company" contentTypeId={company._id} />;
    }

    return (
      <MailForm
        contentType="company"
        contentTypeId={company._id}
        toEmails={company.emails}
        setAttachmentPreview={this.setAttachmentPreview}
        attachmentPreview={this.state.attachmentPreview}
        refetchQueries={['activityLogsCompany']}
      />
    );
  }

  render() {
    const { currentSubtab, currentTab } = this.state;
    const { company, taggerRefetchQueries } = this.props;

    const breadcrumb = [
      { title: __('Companies'), link: '/companies' },
      { title: company.primaryName || 'N/A' }
    ];

    const content = (
      <div>
        <WhiteBox>
          <Tabs>
            <TabTitle
              className={currentTab === 'newNote' ? 'active' : ''}
              onClick={() => this.onChangeTab('newNote')}
            >
              <Icon icon="edit-1" /> {__('New note')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'email' ? 'active' : ''}
              onClick={() => this.onChangeTab('email')}
            >
              <Icon icon="email" /> {__('Email')}
            </TabTitle>
          </Tabs>

          {this.renderTabContent()}
        </WhiteBox>

        <Tabs grayBorder>
          <TabTitle
            className={currentSubtab === 'activity' ? 'active' : ''}
            onClick={() => this.onTabClick('activity')}
          >
            {__('Activity')}
          </TabTitle>
          <TabTitle
            className={currentSubtab === 'notes' ? 'active' : ''}
            onClick={() => this.onTabClick('notes')}
          >
            {__('Notes')}
          </TabTitle>
          <TabTitle
            className={currentSubtab === 'conversations' ? 'active' : ''}
            onClick={() => this.onTabClick('conversations')}
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

export default withRouter<IRouterProps>(CompanyDetails);
