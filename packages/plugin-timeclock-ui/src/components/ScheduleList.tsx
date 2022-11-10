import Button from '@erxes/ui/src/components/Button';
import { menuTimeClock } from '../menu';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import styled from 'styled-components';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import DatePicker from './DatePicker';
import { ISchedule } from '../types';

type Props = {
  scheduleOfMembers: any;
  queryParams: any;
  history: any;
  solveSchedule: (scheduleId: string, status: string) => void;
  solveShift: (shiftId: string, status: string) => void;
  submitRequest: (filledShifts: any) => void;
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

function ScheduleList(props: Props) {
  const {
    queryParams,
    submitRequest,
    history,
    scheduleOfMembers,
    solveSchedule,
    solveShift
  } = props;

  console.log('raw', scheduleOfMembers);

  const [key_counter, setKeyCounter] = useState(0);

  const trigger = (
    <Button id="timeClockButton2" btnStyle="success" icon="plus-circle">
      Create Request
    </Button>
  );

  const [scheduleDates, setScheduleDates] = useState<ISchedule>({});

  const onDateChange = (day_key, selectedDate) => {
    const newDate = { ...scheduleDates[day_key], shiftStart: selectedDate };
    const newScheduleDates = { ...scheduleDates, [day_key]: newDate };
    setScheduleDates(newScheduleDates);
  };

  const onStartTimeChange = (day_key, time) => {
    const newTime = { ...scheduleDates[day_key], shiftStart: time };
    const newScheduleDates = { ...scheduleDates, [day_key]: newTime };
    setScheduleDates(newScheduleDates);
  };

  const onEndTimeChange = (day_key, time) => {
    const newTime = { ...scheduleDates[day_key], shiftEnd: time };
    const newScheduleDates = { ...scheduleDates, [day_key]: newTime };
    setScheduleDates(newScheduleDates);
  };

  const onSubmitClick = () => {
    submitRequest(Object.values(scheduleDates));
  };

  const onUserSelect = userId => {
    router.setParams(history, { userId: `${userId}` });
  };

  const addDay = () => {
    const dates = scheduleDates;
    dates[key_counter] = {
      shiftStart: new Date(),
      shiftEnd: new Date()
    };
    setScheduleDates(dates);

    setKeyCounter(key_counter + 1);
  };

  const renderWeekDays = () => {
    return (
      <>
        {Object.keys(scheduleDates).map(date_key => {
          return (
            <DatePicker
              startTime_value={scheduleDates[date_key].shiftStart}
              endTime_value={scheduleDates[date_key].shiftEnd}
              key={date_key}
              curr_day_key={date_key}
              changeDate={onDateChange}
              changeEndTime={onEndTimeChange}
              changeStartTime={onStartTimeChange}
            />
          );
        })}
      </>
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
      {renderWeekDays()}
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
  // const renderScheduleOfUsers = () => {

  // };
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
  const ListShiftContent = shifts => {
    return (
      <>
        <td>
          {shifts.map(shift => {
            return (
              <div key={shift.shiftStart}>
                {new Date(shift.shiftStart).toDateString()}
              </div>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return (
              <div key={shift.shiftStart}>
                {new Date(shift.shiftStart).toLocaleTimeString()}
              </div>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return (
              <div key={shift.shiftEnd}>
                {' '}
                {new Date(shift.shiftEnd).toLocaleTimeString()}
              </div>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return shift.solved ? (
              <div>{__(shift.status)}</div>
            ) : (
              <div>
                <Button
                  disabled={shift.solved}
                  btnStyle="success"
                  onClick={() => solveShift(shift._id, 'Approved')}
                >
                  Approve
                </Button>
                <Button
                  btnStyle="danger"
                  onClick={() => solveShift(shift._id, 'Rejected')}
                >
                  Reject
                </Button>
              </div>
            );
          })}
        </td>
      </>
    );

    // <>
    //   <div>{new Date(shift.shiftStart).toLocaleTimeString()} start</div>
    //   <div>{shift.shiftEnd} end</div>
    //   <td>
    //     {shift.solved ? (
    //       __(shift.status)
    //     ) : (
    //       <>
    //         <Button
    //           disabled={shift.solved}
    //           btnStyle="success"
    //           onClick={() => solveShift(shift._id, 'Approved')}
    //         >
    //           Approve
    //         </Button>
    //         <Button
    //           btnStyle="danger"
    //           onClick={() => solveShift(shift._id, 'Rejected')}
    //         >
    //           Reject
    //         </Button>
    //       </>
    //     )}
    //   </td>
    // </>
    // );
  };
  const ListScheduleContent = schedule => {
    return (
      <tr style={{}}>
        <td>
          <NameCard user={schedule.user} />
        </td>
        <td>
          {schedule.solved ? (
            __(schedule.status)
          ) : (
            <>
              <Button
                disabled={schedule.solved}
                btnStyle="success"
                onClick={() => solveSchedule(schedule._id, 'Approved')}
              >
                Approve
              </Button>
              <Button
                btnStyle="danger"
                onClick={() => solveSchedule(schedule._id, 'Rejected')}
              >
                Reject
              </Button>
            </>
          )}
        </td>
        {ListShiftContent(schedule.shifts)}
      </tr>
    );
  };

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member')}</th>
          <th>{__('Schedule status')}</th>
          <th>{__('Shift date')}</th>
          <th>{__('Shift start')}</th>
          <th>{__('Shift end')}</th>
          <th>{__('Action')}</th>
        </tr>
      </thead>
      <tbody>
        {scheduleOfMembers &&
          scheduleOfMembers.map(memberSchedule => {
            return ListScheduleContent(memberSchedule);
          })}
      </tbody>
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

export default ScheduleList;
