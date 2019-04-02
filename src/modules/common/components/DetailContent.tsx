import { ActivityList } from 'modules/activityLogs/components';
import { IActivityLogForMonth } from 'modules/activityLogs/types';
import { IUser } from 'modules/auth/types';
import {
  DataWithLoader,
  Icon,
  Tabs,
  TabTitle
} from 'modules/common/components';
import { ActivityContent } from 'modules/common/styles/main';
import { router as routerUtils } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { TabContent } from 'modules/customers/styles';
import { hasAnyActivity } from 'modules/customers/utils';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { WhiteBox } from 'modules/layout/styles';
import { MailForm } from 'modules/settings/integrations/containers/google';
import * as React from 'react';

type Props = {
  activityLog: IActivityLogForMonth[];
  currentUser: IUser;
  target: string;
  loadingLogs: boolean;
  contentType: string;
  contentTypeId: string;
  toEmails?: string[];
  toEmail?: string;
  history: any;
};

type State = {
  currentTab: string;
  currentSubtab: string;
};

class DetailContent extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentSubtab: 'activity',
      currentTab: 'newNote'
    };
  }

  onTabClick = currentSubtab => {
    const { history } = this.props;

    this.setState({ currentSubtab }, () => {
      if (currentSubtab === 'notes') {
        routerUtils.setParams(history, {
          activityType: 'internal_note'
        });
      }

      if (currentSubtab === 'conversations') {
        routerUtils.setParams(history, {
          activityType: 'conversation'
        });
      }

      if (currentSubtab === 'activity') {
        routerUtils.setParams(history, {
          activityType: ''
        });
      }
    });
  };

  onChangeTab = currentTab => {
    this.setState({ currentTab });
  };

  renderSubTabContent() {
    const { currentSubtab } = this.state;

    const { currentUser, activityLog, loadingLogs, target } = this.props;

    const hasActivity = hasAnyActivity(activityLog);

    return (
      <ActivityContent isEmpty={!hasActivity}>
        <DataWithLoader
          loading={loadingLogs}
          count={!loadingLogs && hasActivity ? 1 : 0}
          data={
            <ActivityList
              user={currentUser}
              activities={activityLog}
              target={target}
              type={currentSubtab}
            />
          }
          emptyText="No Activities"
          emptyImage="/images/actions/19.svg"
        />
      </ActivityContent>
    );
  }

  renderTabContent() {
    const { currentTab } = this.state;
    const { contentType, contentTypeId, toEmails, toEmail } = this.props;

    if (currentTab === 'newNote') {
      return (
        <NoteForm contentType={contentType} contentTypeId={contentTypeId} />
      );
    }

    return (
      <TabContent>
        <MailForm
          contentType={contentType}
          contentTypeId={contentTypeId}
          toEmails={toEmails}
          toEmail={toEmail}
          refetchQueries={['activityLogs']}
        />
      </TabContent>
    );
  }

  render() {
    const { currentSubtab, currentTab } = this.state;

    return (
      <div>
        <WhiteBox>
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
        </WhiteBox>

        <Tabs grayBorder={true}>
          <TabTitle
            className={currentSubtab === 'activity' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'activity')}
          >
            {__('Activity')}
          </TabTitle>
          <TabTitle
            className={currentSubtab === 'notes' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'notes')}
          >
            {__('Notes')}
          </TabTitle>
          <TabTitle
            className={currentSubtab === 'conversations' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'conversations')}
          >
            {__('Conversation')}
          </TabTitle>
        </Tabs>

        {this.renderSubTabContent()}
      </div>
    );
  }
}

export default DetailContent;
