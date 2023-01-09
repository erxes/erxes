import { menuTimeClock } from '../menu';
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

type Props = {
  currentDate?: string;
  queryParams: any;
  history: any;
  route?: string;
  startTime?: Date;
  loading: boolean;
  branchesList: IBranch[];

  queryStartDate: string;
  queryEndDate: string;
  queryUserIds: string[];
  queryBranchIds: string[];
  queryDepartmentIds: string[];
  queryPage: number;
  queryPerPage: number;
  searchFilter: string;
};

function List(props: Props) {
  const { branchesList, queryParams, history, route, searchFilter } = props;

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
            getActionBar={setRightActionBar}
            queryParams={queryParams}
            history={history}
          />
        );
        setLoading(false);
        break;
      case 'schedule':
        setModalComponent(
          <ScheduleList
            {...props}
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
        <SideBarList
          branchesList={branchesList}
          queryParams={queryParams}
          history={history}
        />
      }
      transparent={true}
      hasBorder={true}
    />
  );
}

export default List;
