import { ACTIVITY_NAMES } from "../constants";
import { ActivityContent } from "@erxes/ui/src/styles/main";
import { ActivityHeader } from "../styles";
import ActivityList from "./ActivityList";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import { IActivityLog } from "../types";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import { Menu } from "@headlessui/react";
import React from "react";
import { __ } from "coreui/utils";
import { hasAnyActivity } from "../utils";

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
      currentTab: "activity",
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
      activityRenderItem,
    } = this.props;

    const hasActivity = hasAnyActivity(activityLogs);

    return (
      <ActivityContent $isEmpty={!hasActivity}>
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

  renderExtraFilters = () => {
    const { currentTab } = this.state;
    const { extraTabs } = this.props;

    return extraTabs.map(({ name, label }) => {
      return (
        <Menu.Item key={Math.random()}>
          <a
            className={currentTab === name ? "active" : ""}
            onClick={this.onTabClick.bind(this, name)}
          >
            {__(label)}
          </a>
        </Menu.Item>
      );
    });
  };

  render() {
    const { currentTab } = this.state;

    return (
      <div>
        <ActivityHeader>
          <h5>{ACTIVITY_NAMES[currentTab]}</h5>
          <Dropdown
            as={DropdownToggle}
            toggleComponent={<Icon icon="filter-1" size={18} />}
            unmount={false}
          >
            <Menu.Item>
              <a
                className={currentTab === "activity" ? "active" : ""}
                onClick={this.onTabClick.bind(this, "activity")}
              >
                {__("Activity")}
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                className={currentTab === "core:internalNote" ? "active" : ""}
                onClick={this.onTabClick.bind(this, "core:internalNote")}
              >
                {__("Notes")}
              </a>
            </Menu.Item>
            {this.renderExtraFilters()}
          </Dropdown>
        </ActivityHeader>

        {this.renderTabContent()}
      </div>
    );
  }
}

export default ActivityLogs;
