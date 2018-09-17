import { ActivityList } from 'modules/activityLogs/components';
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
import { WhiteBox } from 'modules/layout/styles';
import * as React from 'react';
import { IUser } from '../../../../auth/types';
import { Left } from '../../../styles/deal';
import { IDeal } from '../../../types';

type Props = {
  deal?: IDeal,
  dealActivityLog: any,
  loadingLogs: boolean,
  currentUser?: IUser
};

class Tab extends React.Component<Props, { currentTab: string }> {
  constructor(props) {
    super(props);

    this.onTabClick = this.onTabClick.bind(this);

    this.state = { currentTab: 'activity' };
  }

  onTabClick(currentTab) {
    this.setState({ currentTab });
  }

  renderTabContent() {
    const { currentTab } = this.state;
    const { currentUser, dealActivityLog, deal, loadingLogs } = this.props;
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
              target={deal.name}
              type={currentTab} // show logs filtered by type
            />
          }
          emptyText="No Activities"
          emptyImage="/images/robots/robot-03.svg"
        />
      </ActivityContent>
    );
  }

  render() {
    const { deal } = this.props;
    const { currentTab } = this.state;

    return (
      <Left>
        <WhiteBox>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="compose" /> {__('New note')}
            </TabTitle>
          </Tabs>

          <NoteForm contentType="deal" contentTypeId={deal._id} />
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
        </Tabs>

        {this.renderTabContent()}
      </Left>
    );
  }
}

export default Tab;
