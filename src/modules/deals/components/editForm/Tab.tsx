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
import { hasAnyActivity } from 'modules/customers/utils';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { WhiteBoxRoot } from 'modules/layout/styles';
import * as React from 'react';
import { Left } from '../../styles/deal';
import { IDeal } from '../../types';

type Props = {
  deal?: IDeal;
  dealActivityLog: any;
  loadingLogs: boolean;
  currentUser?: IUser;
};

class Tab extends React.Component<Props, { currentTab: string }> {
  constructor(props) {
    super(props);

    this.state = { currentTab: 'activity' };
  }

  onTabClick = currentTab => {
    this.setState({ currentTab });
  };

  renderTabContent() {
    const { currentTab } = this.state;
    const { dealActivityLog, deal, loadingLogs } = this.props;
    const currentUser = this.props.currentUser || ({} as IUser);
    const hasActivity = hasAnyActivity(dealActivityLog);

    return (
      <ActivityContent isEmpty={!hasActivity}>
        <DataWithLoader
          loading={loadingLogs}
          count={!loadingLogs && hasActivity ? 1 : 0}
          data={
            <ActivityList
              user={currentUser}
              activities={dealActivityLog}
              target={deal && deal.name}
              type={currentTab} // show logs filtered by type
            />
          }
          emptyText="No Activities"
          emptyImage="/images/actions/19.svg"
        />
      </ActivityContent>
    );
  }

  activityTabClick = () => {
    return this.onTabClick('activity');
  };

  notesTabClick = () => {
    return this.onTabClick('notes');
  };

  render() {
    const { deal } = this.props;
    const { currentTab } = this.state;

    return (
      <Left>
        <WhiteBoxRoot>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="edit-1" /> {__('New note')}
            </TabTitle>
          </Tabs>

          <NoteForm contentType="deal" contentTypeId={deal && deal._id} />
        </WhiteBoxRoot>
        <Tabs grayBorder={true}>
          <TabTitle
            className={currentTab === 'activity' ? 'active' : ''}
            onClick={this.activityTabClick}
          >
            {__('Activity')}
          </TabTitle>

          <TabTitle
            className={currentTab === 'notes' ? 'active' : ''}
            onClick={this.notesTabClick}
          >
            {__('Notes')}
          </TabTitle>
        </Tabs>

        {this.renderTabContent()}
      </Left>
    );
  }
}

export default Tab;
