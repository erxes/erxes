import React, { useState } from 'react';
import { ITimelog } from '../../types';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Button from '@erxes/ui/src/components/Button';
import { CustomRangeContainer, FlexCenter, FlexColumn } from '../../styles';
import { ControlLabel } from '@erxes/ui/src/components/form';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Table from '@erxes/ui/src/components/table';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { dateFormat, timeFormat } from '../../constants';
import dayjs from 'dayjs';
import Tip from '@erxes/ui/src/components/Tip';

type Props = {
  queryParams: any;
  history: any;
  timelogs: ITimelog[];
  totalCount?: number;

  isCurrentUserAdmin: boolean;

  extractTimeLogsFromMsSQL: (startDate: Date, endDate: Date) => void;
  createTimeclockFromLog: (userId: string, timelog: Date) => void;

  showSideBar: (sideBar: boolean) => void;
  getActionBar: (actionBar: any) => void;
  getPagination: (pagination: any) => void;
};

function ReportList(props: Props) {
  const {
    totalCount,
    timelogs,
    extractTimeLogsFromMsSQL,
    getPagination,
    showSideBar,
    getActionBar,
    createTimeclockFromLog,
    isCurrentUserAdmin
  } = props;

  const [startDate, setStartDate] = useState(
    new Date(localStorage.getItem('startDate') || Date.now())
  );
  const [endDate, setEndDate] = useState(
    new Date(localStorage.getItem('endDate') || Date.now())
  );

  const extractTimeLogs = (startDateRange, endDateRange) => {
    extractTimeLogsFromMsSQL(startDateRange, endDateRange);
  };

  const onStartDateChange = dateVal => {
    setStartDate(dateVal);
    localStorage.setItem('startDate', startDate.toISOString());
  };

  const onEndDateChange = dateVal => {
    setEndDate(dateVal);
    localStorage.setItem('endDate', endDate.toISOString());
  };

  const extractTrigger = isCurrentUserAdmin ? (
    <Button icon="plus-circle">Extract time logs</Button>
  ) : (
    <></>
  );

  const extractContent = () => (
    <FlexColumn marginNum={10}>
      <ControlLabel>Select Date Range</ControlLabel>
      <CustomRangeContainer>
        <DateControl
          required={false}
          value={startDate}
          name="startDate"
          placeholder={'Starting date'}
          dateFormat={'YYYY-MM-DD'}
          onChange={onStartDateChange}
        />
        <DateControl
          required={false}
          value={endDate}
          name="endDate"
          placeholder={'Ending date'}
          dateFormat={'YYYY-MM-DD'}
          onChange={onEndDateChange}
        />
      </CustomRangeContainer>
      <FlexCenter>
        <Button onClick={() => extractTimeLogs(startDate, endDate)}>
          Extract all data
        </Button>
      </FlexCenter>
    </FlexColumn>
  );

  const actionBarRight = (
    <>
      <ModalTrigger
        title={__('Extract time logs')}
        trigger={extractTrigger}
        content={extractContent}
      />
    </>
  );

  const actionBar = (
    <Wrapper.ActionBar
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Employee Id')}</th>
          <th>{__('Team member')}</th>
          <th>{__('Date')}</th>
          <th>{__('Time')}</th>
          <th>{__('Device')}</th>
          <th>{__('Action')}</th>
        </tr>
      </thead>
      <tbody>
        {timelogs.map(timelog => {
          return (
            <tr key={timelog._id}>
              <td>{timelog.user && timelog.user.employeeId}</td>
              <td>
                {timelog.user && timelog.user.details
                  ? timelog.user.details.fullName ||
                    `${timelog.user.details.firstName} ${timelog.user.details.lastName}`
                  : timelog.user.employeeId}
              </td>
              <td>{dayjs(timelog.timelog).format(dateFormat)}</td>
              <td>{dayjs(timelog.timelog).format(timeFormat)}</td>
              <td>{timelog.deviceName}</td>
              <td>
                <Tip text={__('Create Timeclock')} placement="top">
                  <Button
                    btnStyle="link"
                    onClick={() =>
                      createTimeclockFromLog(timelog.user._id, timelog.timelog)
                    }
                    icon="clock-eight"
                  />
                </Tip>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );

  getPagination(<Pagination count={totalCount} />);
  showSideBar(true);
  getActionBar(actionBar);

  return content;
}

export default ReportList;
