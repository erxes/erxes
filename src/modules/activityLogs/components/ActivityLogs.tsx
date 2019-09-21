import ActivityList from 'modules/activityLogs/components/ActivityList';
import { IActivityLogForMonth } from 'modules/activityLogs/types';
import { IUser } from 'modules/auth/types';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { ActivityContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { hasAnyActivity } from 'modules/customers/utils';
import React from 'react';

type Props = {
  activityLogs: IActivityLogForMonth[];
  currentUser: IUser;
  target?: string;
  loadingLogs: boolean;
  extraTabs: Array<{ name: string; label: string }>;
  onTabClick: (currentTab: string) => void;
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

    const { currentUser, activityLogs, loadingLogs, target } = this.props;

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
            className={currentTab === 'internal_note' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'internal_note')}
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
