import Button from '@erxes/ui/src/components/Button';
import { ITimeclock } from '../../types';
import Row from './TimeclockRow';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import TimeForm from '../../containers/timeclock/TimeFormList';
import { CustomRangeContainer, FlexCenter, FlexColumn } from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';

type Props = {
  queryParams: any;
  history: any;
  startTime?: Date;
  timeclocks: ITimeclock[];
  startClockTime?: (userId: string) => void;
  loading: boolean;
  getActionBar: (actionBar: any) => void;
  extractAllMySqlData: (startDate: Date, endDate: Date) => void;
};

function List({
  timeclocks,
  startClockTime,
  getActionBar,
  extractAllMySqlData
}: Props) {
  const trigger = (
    <Button btnStyle={'success'} icon="plus-circle">
      Start Shift
    </Button>
  );

  const [startDate, setStartDate] = useState(
    new Date(localStorage.getItem('startDate') || Date.now())
  );
  const [endDate, setEndDate] = useState(
    new Date(localStorage.getItem('endDate') || Date.now())
  );

  const extractTrigger = <Button icon="plus-circle">Extract all data</Button>;

  const modalContent = props => (
    <TimeForm
      {...props}
      startClockTime={startClockTime}
      timeclocks={timeclocks}
    />
  );

  const onStartDateChange = dateVal => {
    setStartDate(dateVal);
    localStorage.setItem('startDate', startDate.toISOString());
  };

  const onEndDateChange = dateVal => {
    setEndDate(dateVal);
    localStorage.setItem('endDate', endDate.toISOString());
  };
  const extractContent = props => (
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
        <Button onClick={() => extractAllMySqlData(startDate, endDate)}>
          Extract all data
        </Button>
      </FlexCenter>
    </FlexColumn>
  );

  const actionBarRight = (
    <>
      <ModalTrigger
        title={__('Extract all data')}
        trigger={extractTrigger}
        content={extractContent}
      />
      <ModalTrigger
        title={__('Start shift')}
        trigger={trigger}
        content={modalContent}
      />
    </>
  );

  const title = (
    <Title capitalize={true}>
      {__(new Date().toDateString().slice(0, -4))}
    </Title>
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={title}
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );

  const compareUserName = (a, b) => {
    if (a.employeeUserName < b.employeeUserName) {
      return -1;
    }
    if (a.employeeUserName > b.employeeUserName) {
      return 1;
    }
    return 0;
  };

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member')}</th>
          <th>{__('Shift date')}</th>
          <th>{__('Shift started')}</th>
          <th>{__('Shift ended')}</th>
          <th>{__('Overnight')}</th>
          <th>{__('Branch / Device name')}</th>
          <th>{__('Device type')}</th>
          <th>{__('Status')}</th>
        </tr>
      </thead>
      <tbody>
        {timeclocks.sort(compareUserName).map(timeclock => {
          return <Row key={timeclock._id} timeclock={timeclock} />;
        })}
      </tbody>
    </Table>
  );

  getActionBar(actionBar);
  return content;
}

export default List;
