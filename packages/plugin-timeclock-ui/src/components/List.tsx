import { menuTimeClock } from "../constants";
import { __ } from "@erxes/ui/src/utils";
import React, { useState, useEffect } from "react";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import SideBarList from "../containers/sidebar/SideBarList";
import ConfigList from "../containers/config/ConfigList";
import TimeclockList from "../containers/timeclock/TimeclockList2";
import AbsenceList from "../containers/absence/AbsenceList";
import ReportList from "../containers/report/ReportList";
import ScheduleList from "../containers/schedule/ScheduleList";
import LogsList from "../containers/logs/LogsList";
import { IBranch, IDepartment } from "@erxes/ui/src/team/types";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { IUser } from "@erxes/ui/src/auth/types";

type Props = {
  currentUser: IUser;
  branches: IBranch[];
  departments: IDepartment[];

  isCurrentUserAdmin: boolean;
  isCurrentUserSupervisor: boolean;

  currentDate?: string;
  queryParams: any;
  route?: string;
  startTime?: Date;
  loading: boolean;

  searchFilter: string;
};

function List(props: Props) {
  const { queryParams, isCurrentUserAdmin, route, searchFilter } = props;

  const [showSideBar, setShowSideBar] = useState(true);
  const [rightActionBar, setRightActionBar] = useState(<div />);
  const [component, setComponent] = useState(<div />);
  const [paginationFooter, setPaginationFooter] = useState(<div />);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    switch (route) {
      case "config":
        if (isCurrentUserAdmin) {
          setComponent(
            <ConfigList
              {...props}
              getPagination={setPaginationFooter}
              showSideBar={setShowSideBar}
              getActionBar={setRightActionBar}
              queryParams={queryParams}
            />
          );
        }
        setLoading(false);
        break;
      case "report":
        setComponent(
          <ReportList
            {...props}
            reportType={queryParams.reportType}
            showSideBar={setShowSideBar}
            getActionBar={setRightActionBar}
            queryParams={queryParams}
            getPagination={setPaginationFooter}
          />
        );
        setLoading(false);
        break;
      case "schedule":
        setComponent(
          <ScheduleList
            {...props}
            showSideBar={setShowSideBar}
            getPagination={setPaginationFooter}
            getActionBar={setRightActionBar}
            queryParams={queryParams}
          />
        );
        setLoading(false);
        break;
      case "requests":
        setComponent(
          <AbsenceList
            {...props}
            showSideBar={setShowSideBar}
            getPagination={setPaginationFooter}
            getActionBar={setRightActionBar}
            queryParams={queryParams}
          />
        );
        setLoading(false);
        break;
      case "logs":
        if (!isEnabled("bichil")) {
          setComponent(
            <LogsList
              {...props}
              showSideBar={setShowSideBar}
              getPagination={setPaginationFooter}
              getActionBar={setRightActionBar}
              queryParams={queryParams}
            />
          );
        }
        setLoading(false);
        break;
      default:
        setComponent(
          <TimeclockList
            {...props}
            showSideBar={setShowSideBar}
            getActionBar={setRightActionBar}
            getPagination={setPaginationFooter}
            queryParams={queryParams}
          />
        );
        setLoading(false);
    }
  }, [queryParams]);

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Timeclocks")}
          submenu={menuTimeClock(searchFilter, isCurrentUserAdmin)}
        />
      }
      actionBar={rightActionBar}
      footer={paginationFooter}
      content={
        <DataWithLoader
          data={component}
          loading={loading}
          emptyText={__("Theres no timeclock")}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={
        showSideBar && <SideBarList {...props} queryParams={queryParams} />
      }
      transparent={true}
      hasBorder={true}
    />
  );
}

export default List;
