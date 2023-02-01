import { menuTimeClock } from '../constants';
import { __ } from '@erxes/ui/src/utils';
import React, { useState, useEffect } from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import SideBarList from '../containers/sidebar/SideBarList';
import ConfigList from '../containers/config/ConfigList';
import TimeclockList from '../containers/timeclock/TimeclockList';
import AbsenceList from '../containers/absence/AbsenceList';
import ReportList from '../containers/report/ReportList';
import ScheduleList from '../containers/schedule/ScheduleList';
import { IBranch } from '@erxes/ui/src/team/types';
import { IScheduleConfig } from '../types';

type Props = {
  currentDate?: string;
  queryParams: any;
  history: any;
  route?: string;
  startTime?: Date;
  loading: boolean;
  branchesList: IBranch[];
  scheduleConfigs: IScheduleConfig[];
  searchFilter: string;
};

function List(props: Props) {
  const { branchesList, queryParams, history, route, searchFilter } = props;
  const [showSideBar, setShowSideBar] = useState(true);
  const [rightActionBar, setRightActionBar] = useState(<div />);
  const [Component, setModalComponent] = useState(<div />);
  const [PaginationFooter, setPagination] = useState(<div />);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    switch (route) {
      case 'config':
        setModalComponent(
          <ConfigList
            {...props}
            showSideBar={setShowSideBar}
            getActionBar={setRightActionBar}
            queryParams={queryParams}
            history={history}
          />
        );
        setLoading(false);
        break;
      case 'report':
        setModalComponent(
          <ReportList
            {...props}
            reportType={queryParams.reportType}
            showSideBar={setShowSideBar}
            getActionBar={setRightActionBar}
            queryParams={queryParams}
            getPagination={setPagination}
            history={history}
          />
        );
        setLoading(false);
        break;
      case 'schedule':
        setModalComponent(
          <ScheduleList
            {...props}
            showSideBar={setShowSideBar}
            getPagination={setPagination}
            getActionBar={setRightActionBar}
            queryParams={queryParams}
            history={history}
          />
        );
        setLoading(false);
        break;
      case 'requests':
        setModalComponent(
          <AbsenceList
            {...props}
            showSideBar={setShowSideBar}
            getPagination={setPagination}
            getActionBar={setRightActionBar}
            queryParams={queryParams}
            history={history}
          />
        );
        setLoading(false);
        break;
      default:
        setModalComponent(
          <TimeclockList
            {...props}
            showSideBar={setShowSideBar}
            getActionBar={setRightActionBar}
            getPagination={setPagination}
            history={history}
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
          title={__('Timeclocks')}
          submenu={menuTimeClock(searchFilter)}
        />
      }
      actionBar={rightActionBar}
      footer={PaginationFooter}
      content={
        <DataWithLoader
          data={Component}
          loading={loading}
          emptyText={__('Theres no timeclock')}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={
        showSideBar && (
          <SideBarList
            branchesList={branchesList}
            queryParams={queryParams}
            history={history}
          />
        )
      }
      transparent={true}
      hasBorder={true}
    />
  );
}

export default List;
