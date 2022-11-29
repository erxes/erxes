import Button from '@erxes/ui/src/components/Button';
import { menuTimeClock } from '../menu';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import DateRange from './DateRange';
import DateFilter from '@erxes/ui/src/components/DateFilter';
import dayjs from 'dayjs';
import DatePicker from './DateTimePicker';
import { ISchedule } from '../types';
import styledTS from 'styled-components-ts';
import styled from 'styled-components';
import { colors, dimensions } from '@erxes/ui/src/styles';
import ScheduleConfig from './ScheduleConfig';
import Select from 'react-select-plus';

type Props = {
  scheduleOfMembers: any;
  queryParams: any;
  history: any;
  solveSchedule: (scheduleId: string, status: string) => void;
  solveShift: (shiftId: string, status: string) => void;
  submitRequest: (userId: string[], filledShifts: any) => void;
  submitShift: (userIds: string[], filledShifts: any) => void;
};

const Datetime = asyncComponent(
  () =>
    import(/* webpackChunkName: "Datetime" */ '@nateradebaugh/react-datetime')
  // import('react-time-picker')
);

const Input = styledTS<{ round?: boolean; hasError?: boolean; align?: string }>(
  styled.input
)`
  border: none;
  width: 100%;
  padding: ${dimensions.unitSpacing}px 0;
  color: ${colors.textPrimary};
  border-bottom: 1px solid;
  border-color:${props =>
    props.hasError ? colors.colorCoreRed : colors.colorShadowGray};
  background: none;
  transition: all 0.3s ease;

  ${props => {
    if (props.round) {
      return `
        font-size: 13px;
        border: 1px solid ${colors.borderDarker};
        border-radius: 20px;
        padding: 5px 20px;
      `;
    }

    return '';
  }};

  ${props => {
    if (props.align) {
      return `
        text-align: ${props.align};
      `;
    }

    return '';
  }};

  &:hover {
    border-color: ${colors.colorLightGray};
  }

  &:focus {
    outline: none;
    border-color: ${colors.colorSecondary};
  }

  ::placeholder {
    color: #aaa;
  }
`;

function ScheduleList(props: Props) {
  const {
    queryParams,
    submitRequest,
    submitShift,
    history,
    scheduleOfMembers,
    solveSchedule,
    solveShift
  } = props;

  const [dateKeyCounter, setKeyCounter] = useState('');
  const [userIds, setUserIds] = useState(['']);

  const trigger = (
    <Button id="timeClockButton2" btnStyle="success" icon="plus-circle">
      Create Request
    </Button>
  );

  const adminTrigger = (
    <Button id="timeClockButton2" btnStyle="success" icon="plus-circle">
      Create Request - Admin
    </Button>
  );

  const adminConfigTrigger = (
    <Button id="timeClockButton2" btnStyle="success" icon="plus-circle">
      Schedule Configuration - Admin
    </Button>
  );
  const [dateRangeStart, setDateStart] = useState(new Date());
  const [dateRangeEnd, setDateEnd] = useState(new Date());
  const [scheduleDates, setScheduleDates] = useState<ISchedule>({});
  const [contentType, setContentType] = useState('');
  const [configDays, setConfigDays] = useState<ISchedule>({
    Monday: { display: true },
    Tuesday: { display: true },
    Wednesday: { display: true },
    Thursday: { display: true },
    Friday: { display: true },
    Saturday: { display: true },
    Sunday: { display: true }
  });

  const onRemoveDate = day_key => {
    delete scheduleDates[day_key];
    setScheduleDates({
      ...scheduleDates
    });
    setKeyCounter(Object.keys(scheduleDates).at(-1) || '');
  };

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
    const getCorrectDateTime = new Date(
      scheduleDates[day_key].shiftStart?.toDateString() +
        ',' +
        time.toTimeString()
    );
    const newTime = { ...scheduleDates[day_key], shiftEnd: getCorrectDateTime };
    const newScheduleDates = { ...scheduleDates, [day_key]: newTime };
    setScheduleDates(newScheduleDates);
  };

  const onSubmitClick = () => {
    submitRequest(userIds, Object.values(scheduleDates));
  };
  const onAdminSubmitClick = () => {
    submitShift(userIds, Object.values(scheduleDates));
  };

  const onUserSelect = users => {
    setUserIds(users);
  };

  const addDay = () => {
    const dates = scheduleDates;
    const getLatestDayKey = dateKeyCounter
      ? dayjs(dateKeyCounter)
          .add(1, 'day')
          .toDate()
          .toDateString()
      : new Date().toDateString();

    dates[getLatestDayKey] = {
      shiftStart: new Date(getLatestDayKey),
      shiftEnd: new Date(getLatestDayKey)
    };

    setScheduleDates(dates);
    setKeyCounter(getLatestDayKey);
  };

  const renderWeekDays = () => {
    return (
      <>
        {Object.keys(scheduleDates).map(date_key => {
          return (
            <DatePicker
              startTime_value={scheduleDates[date_key].shiftStart || new Date()}
              endTime_value={scheduleDates[date_key].shiftEnd || new Date()}
              key={date_key}
              curr_day_key={date_key}
              changeDate={onDateChange}
              removeDate={onRemoveDate}
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
  const adminModalContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <SelectTeamMembers
        queryParams={queryParams}
        label={'Team member'}
        onSelect={onUserSelect}
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
        <Button style={{ marginTop: 10 }} onClick={onAdminSubmitClick}>
          {'Submit'}
        </Button>
      </div>
    </div>
  );

  const toggleWeekDays = dayKey => {
    const oldConfigBoolean = {
      ...configDays[dayKey],
      display: !configDays[dayKey].display
    };
    const newConfigDays = { ...configDays, [dayKey]: oldConfigBoolean };
    setConfigDays(newConfigDays);
  };

  const renderWeekendSettings = () => {
    return (
      <>
        {Object.keys(configDays).map(weekDay => (
          <ScheduleConfig
            key={weekDay}
            weekDay={weekDay}
            toggleWeekDays={toggleWeekDays}
          />
        ))}
      </>
    );
  };

  const renderConfigDays = () => {
    return Object.keys(configDays).map(configDay => {
      return (
        <div
          key={configDay}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          {configDays[configDay].display && (
            <>
              {configDay}
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Datetime
                  defaultValue={new Date()}
                  dateFormat={false}
                  timeIntervals={15}
                  timeFormat="hh:mm a"
                />
                <Datetime
                  defaultValue={new Date()}
                  dateFormat={false}
                  timeIntervals={15}
                  timeFormat="hh:mm a"
                />
              </div>
            </>
          )}
        </div>
      );
    });
  };
  const onDateRangeStartChange = (newStart: Date) => {
    setDateStart(newStart);
  };
  const onDateRangeEndChange = (newEnd: Date) => {
    setDateEnd(newEnd);
  };

  const onSaveDateRange = () => {
    const format = 'YYYY-MM-DD HH:mm';
    const formattedStartDate = dayjs(dateRangeStart).format(format);
    const formattedEndDate = dayjs(dateRangeEnd).format(format);

    router.setParams(history, {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });

    const totalDatesArray: string[] = [];

    let temp = dayjs(dateRangeStart);
    const endRange = dayjs(dateRangeEnd);
    while (temp <= endRange) {
      totalDatesArray.push(temp.toDate().toDateString());
      temp = temp.add(1, 'day');
    }

    const newDatesByRange: ISchedule = scheduleDates;

    for (const eachDay of totalDatesArray) {
      newDatesByRange[eachDay] = {
        shiftStart: new Date(eachDay),
        shiftEnd: new Date(eachDay)
      };
      setKeyCounter(eachDay);
    }

    const difference = Object.keys(newDatesByRange).filter(
      x => !totalDatesArray.includes(x)
    );

    for (const removeKey of difference) {
      delete newDatesByRange[removeKey];
    }

    setScheduleDates(newDatesByRange);
  };

  const adminConfigByDate = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <DateRange
          startDate={dateRangeStart}
          endDate={dateRangeEnd}
          onChangeEnd={onDateRangeEndChange}
          onChangeStart={onDateRangeStartChange}
          onSaveButton={onSaveDateRange}
        />
        {renderWeekDays()}
      </div>
    );
  };

  const adminConfigByDay = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <strong>Set as Weekend</strong>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        {renderWeekendSettings()}
      </div>
      {renderConfigDays()}
      <div>
        <div>
          <strong>Repeat Cycle</strong>
        </div>
        <Input
          type="number"
          name="cycleNumber"
          placeholder="Please input number"
          // onChange={setInputValue}
        />
        <Select
          value={contentType}
          onChange={onContentTypeSelect}
          placeholder="How long"
          options={['Days', 'Weeks', 'Months'].map(day => ({
            value: day,
            label: __(day)
          }))}
        />
      </div>
    </div>
  );

  const onContentTypeSelect = contntType => {
    localStorage.setItem('contentType', JSON.stringify(contntType));
    const contType = JSON.parse(localStorage.getItem('contentType') || '[]')
      .value;
    setContentType(contType);
  };

  const defaultContent = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SelectTeamMembers
          queryParams={queryParams}
          label={'Team member'}
          onSelect={onUserSelect}
          name="userId"
        />
        <Select
          value={contentType}
          onChange={onContentTypeSelect}
          placeholder="Select Content Type"
          options={['By Date Range', 'By Week Day'].map(day => ({
            value: day,
            label: __(day)
          }))}
        />
        {contentType === 'By Date Range'
          ? adminConfigByDate()
          : adminConfigByDay()}
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
          <Button style={{ marginTop: 10 }} onClick={onAdminSubmitClick}>
            {'Submit'}
          </Button>
        </div>
      </div>
    );
  };

  const actionBarRight = (
    <>
      <ModalTrigger
        title={__('Send schedule request')}
        trigger={trigger}
        content={modalContent}
      />
      <ModalTrigger
        title={__('Create schedule - Admin')}
        trigger={adminTrigger}
        content={adminModalContent}
      />
      <ModalTrigger
        size="lg"
        title={__('Schedule config - Admin')}
        trigger={adminConfigTrigger}
        content={defaultContent}
      />
    </>
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
    />
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
  };
  const ListScheduleContent = schedule => {
    return (
      <tr>
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
