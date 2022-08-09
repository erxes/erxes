import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';

import { ActivityContent } from '@erxes/ui/src/styles/main';
import ActivityList from './ActivityList';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IActivityLog } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { __ } from 'coreui/utils';
import { hasAnyActivity } from '../utils';

type Props = {
  activityLogs: IActivityLog[];
  currentUser: IUser;
  target?: string;
  loadingLogs: boolean;
  extraTabs: Array<{ name: string; label: string }>;
  onTabClick: (currentTab: string) => void;
  activityRenderItem?: (
    activity: IActivityLog,
    currentUser?: IUser
  ) => React.ReactNode;
};

type State = {
  currentTab: string;
};

class ActivityLogs extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'activity'
    };
  }

  onTabClick = (currentTab: string) => {
    const { onTabClick } = this.props;

    this.setState({ currentTab }, () => {
      onTabClick(currentTab);
    });
  };

  renderTabContent() {
    const { currentTab } = this.state;
    const {
      currentUser,
      activityLogs,
      loadingLogs,
      target,
      activityRenderItem
    } = this.props;

    const hasActivity = hasAnyActivity(activityLogs);

    return (
      <ActivityContent isEmpty={!hasActivity}>
        <DataWithLoader
          loading={loadingLogs}
          count={!loadingLogs && hasActivity ? 1 : 0}
          data={
            <ActivityList
              user={currentUser}
              activities={activityLogs}
              target={target}
              type={currentTab}
              activityRenderItem={activityRenderItem}
            />
          }
          emptyText="No Activities"
          emptyImage="/images/actions/19.svg"
        />
      </ActivityContent>
    );
  }

  renderExtraTabs = () => {
    const { currentTab } = this.state;
    const { extraTabs } = this.props;

    return extraTabs.map(({ name, label }) => {
      return (
        <TabTitle
          key={Math.random()}
          className={currentTab === name ? 'active' : ''}
          onClick={this.onTabClick.bind(this, name)}
        >
          {__(label)}
        </TabTitle>
      );
    });
  };

  render() {
    const { currentTab } = this.state;

    return (
      <div>
        <Tabs grayBorder={true}>
          <TabTitle
            className={currentTab === 'activity' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'activity')}
          >
            {__('Activity')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'internalnotes:note' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'internalnotes:note')}
          >
            {__('Notes')}
          </TabTitle>
          {this.renderExtraTabs()}
        </Tabs>

        {this.renderTabContent()}
      </div>
    );
  }
}

export default ActivityLogs;
