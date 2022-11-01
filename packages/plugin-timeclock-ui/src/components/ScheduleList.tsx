import Button from '@erxes/ui/src/components/Button';
import dayjs from 'dayjs';
import { menuTimeClock } from '../menu';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import styled from 'styled-components';
import Select from 'react-select-plus';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { Input } from '@erxes/ui/src/components/form/styles';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import DateFilter from '@erxes/ui/src/components/DateFilter';
import { ISchedule, ITimeclock } from '../types';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

type Props = {
  // schedules: ISchedule[];
  queryParams: any;
  history: any;
  submitRequest: (filledShifts: ITimeclock[]) => void;
};

const FlexRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  > button {
    margin: 0 10px;
  }

  .Select {
    flex: 1;
  }
`;

const Datetime = asyncComponent(
  () =>
    import(/* webpackChunkName: "Datetime" */ '@nateradebaugh/react-datetime')
  // import('react-time-picker')
);

const addDaysOfNextWeek = (today: Date) => {
  const nextWeek: Date[] = [];
  const diffFromNextMon = 7 - today.getDay();
  const nextMon = dayjs(today)
    .add(diffFromNextMon + 1, 'day')
    .toDate();
  nextWeek.push(nextMon);

  for (let i = 1; i < 7; i++) {
    nextWeek.push(
      dayjs(nextMon)
        .add(i, 'day')
        .toDate()
    );
  }

  return nextWeek;
};

function AbsenceList(props: Props) {
  const { queryParams, submitRequest } = props;
  const [explanation, setTextReason] = useState('');
  const shiftStarted = localStorage.getItem('shiftStarted') === 'true' || false;

  const trigger = (
    <Button id="timeClockButton2" btnStyle="success" icon="plus-circle">
      Create Request
    </Button>
  );
  let week_day_key = 0;
  const today = new Date().toLocaleDateString();
  // const nextWeekDic = {};
  // nextWeekDic[today] = { start: new Date(), end: new Date() };

  const [selectedDays, setSelectedTime] = useState({
    [today]: { start: new Date(), end: new Date() }
  });
  // setSelectedTime({ [today]: { start: new Date(), end: new Date() } });
  console.log('selected', selectedDays);

  const [weekDays, setWeek] = useState([
    <div style={{ display: 'flex', flexDirection: 'row' }} key={week_day_key}>
      <Datetime
        value={new Date()}
        timeIntervals={15}
        timeFormat="hh:mm a"
        // onChange={onDateStartChange}
      />
      <Datetime
        value={new Date()}
        dateFormat={false}
        timeIntervals={15}
        timeFormat="hh:mm a"
        // onChange={onDateStartChange}
      />
    </div>
  ]);

  const onDateStartChange = val => {
    const val_to_day = new Date(val).toLocaleDateString();
    // nextWeekDic[new Date(val).toLocaleDateString()].start = val;
  };

  const onDateEndChange = val => {
    const date = new Date(val).toLocaleDateString();
    if (date) {
      nextWeekDic[date].end = val;
    }
  };
  // console.log(nextWeekDic);

  const addDay = () => {
    setWeek(
      weekDays.concat(
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Datetime
            value={new Date()}
            timeIntervals={15}
            timeFormat="hh:mm a"
            onChange={onDateStartChange}
          />
          <Datetime
            value={new Date()}
            dateFormat={false}
            timeIntervals={15}
            timeFormat="hh:mm a"
            onChange={onDateStartChange}
          />
        </div>
      )
    );
  };

  const modalContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <SelectTeamMembers
        queryParams={queryParams}
        label={'Team member'}
        onSelect={onUserSelect}
        multi={false}
        name="userId"
      />
      {weekDays}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center'
        }}
      >
        <Button style={{ marginTop: 10 }} onClick={addDay}>
          Add day
        </Button>
        <Button style={{ marginTop: 10 }} onClick={onSubmitClick}>
          {'Submit'}
        </Button>
      </div>
    </div>
  );

  const onSubmitClick = () => {
    // submitRequest(explanation);
  };

  const setInputValue = e => {
    const expl = e.target.value;
    console.log(expl);
    setTextReason(expl);
  };

  const onUserSelect = userId => {
    router.setParams(history, { userId: `${userId}` });
  };
  const onReasonSelect = reason => {
    router.setParams(history, { reason: `${reason.value}` });
  };

  const actionBarRight = (
    <ModalTrigger
      title={__('Send absence request')}
      trigger={trigger}
      content={modalContent}
    />
  );

  const title = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: '20px',
        fontSize: '24px'
      }}
    >
      {/* <Title>{__(`Week of ${startOfWeek}`)}</Title> */}
    </div>
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={title}
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );

  const ListAbsenceContent = absence => {
    console.log('absence', absence);

    const startTime = new Date(absence.startTime);
    const endTime = new Date(absence.endTime);
    const startingDate = startTime.toDateString();
    const startingTime = startTime.toLocaleTimeString();
    const endingDate = endTime.toDateString();
    const endingTime = endTime.toLocaleTimeString();
    return (
      <tr>
        <td>{<NameCard user={absence.user} /> || '-'}</td>
        <td>{startingTime + ', ' + startingDate || '-'}</td>
        <td>{endingTime + ', ' + endingDate || '-'}</td>
        <td>{absence.reason || '-'}</td>
        <td>{absence.explanation || '-'}</td>
      </tr>
    );
  };

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member')}</th>
          <th>{__('Shift date')}</th>
          <th>{__('Shift start')}</th>
          <th>{__('Shift end')}</th>
        </tr>
      </thead>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(
      /* webpackChunkName: "List - Timeclocks" */ '../containers/SideBarList'
    )
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Timeclocks')} submenu={menuTimeClock} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={false}
          emptyText={__('Theres no timeclock')}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={true}
      hasBorder={true}
      leftSidebar={
        <SideBarList
          onUserSelect={onUserSelect}
          queryParams={queryParams}
          history={history}
        />
      }
    />
  );
}

export default AbsenceList;
