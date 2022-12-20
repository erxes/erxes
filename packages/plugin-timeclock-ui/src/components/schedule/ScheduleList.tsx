import Button from '@erxes/ui/src/components/Button';
import { menuTimeClock } from '../../menu';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import DateRange from '../datepicker/DateRange';
import dayjs from 'dayjs';
import DatePicker from '../datepicker/DateTimePicker';
import { ISchedule } from '../../types';
import ScheduleConfig from './ScheduleDayToggleConfig';
import Select from 'react-select-plus';
import SelectDepartments from '@erxes/ui-settings/src/departments/containers/SelectDepartments';
import { CustomRow, Input } from '../../styles';

import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Row } from '../../styles';
import { IBranch } from '@erxes/ui/src/team/types';
import { CustomRangeContainer } from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import SideBarList from '../../containers/SideBarList';
import Datetime from '@nateradebaugh/react-datetime';

type Props = {
  scheduleOfMembers: any;
  queryParams: any;
  history: any;
  branchesList: IBranch[];
  solveSchedule: (scheduleId: string, status: string) => void;
  solveShift: (shiftId: string, status: string) => void;
  submitRequest: (userId: string[], filledShifts: any) => void;
  submitShift: (userIds: string[], filledShifts: any) => void;
};

function ScheduleList(props: Props) {
  const {
    queryParams,
    submitRequest,
    submitShift,
    history,
    scheduleOfMembers,
    solveSchedule,
    solveShift,
    branchesList
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
    <Button id="timeClockButton2" btnStyle="primary" icon="plus-circle">
      Schedule Configuration - Admin
    </Button>
  );

  const [dateRangeStart, setDateStart] = useState(new Date());
  const [dateRangeEnd, setDateEnd] = useState(new Date());
  const [scheduleDates, setScheduleDates] = useState<ISchedule>({});
  const [contentType, setContentType] = useState('');
  const [selectedDeptId, setDepartments] = useState('');
  const [selectedBranchId, setBranches] = useState(['']);
  const [configDays, setConfigDays] = useState<ISchedule>({
    Monday: { display: true },
    Tuesday: { display: true },
    Wednesday: { display: true },
    Thursday: { display: true },
    Friday: { display: true },
    Saturday: { display: true },
    Sunday: { display: true }
  });

  const renderBranchOptions = (branches: any[]) => {
    return branches.map(branch => ({
      value: branch._id,
      label: branch.title
    }));
  };

  const onBranchSelect = selectedBranch => {
    setBranches(selectedBranch);

    const branchIds: any[] = [];
    selectedBranch.map(branch => branchIds.push(branch.value));

    router.setParams(history, {
      branchIds: `${branchIds}`
    });
  };

  const onDepartmentSelect = dept => {
    setDepartments(dept);
    const departmentIds: any[] = [];

    dept.map(department => departmentIds.push(department));

    router.setParams(history, {
      departmentIds: `${departmentIds}`
    });
  };

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

  const onSubmitClick = closeModal => {
    submitRequest(userIds, Object.values(scheduleDates));
    closeModal();
  };
  const onAdminSubmitClick = closeModal => {
    submitShift(userIds, Object.values(scheduleDates));
    closeModal();
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

  const modalContent = ({ closeModal }) => (
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
        <Button
          style={{ marginTop: 10 }}
          onClick={() => onSubmitClick(closeModal)}
        >
          {'Submit'}
        </Button>
      </div>
    </div>
  );

  const adminModalContent = ({ closeModal }) => (
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
        <Button
          style={{ marginTop: 10 }}
          onClick={() => onAdminSubmitClick(closeModal)}
        >
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
                  timeFormat="hh:mm a"
                />
                <Datetime
                  defaultValue={new Date()}
                  dateFormat={false}
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
  const onSelectDateChange = dateString => {
    if (dateString) {
      const getDate = new Date(dateString).toDateString();

      const newDates = scheduleDates;

      newDates[getDate] = {
        shiftStart: new Date(getDate),
        shiftEnd: new Date(getDate)
      };

      setScheduleDates(newDates);
      setKeyCounter(getDate);
    }
  };

  const adminConfigBySelect = () => (
    <>
      <CustomRangeContainer>
        <DateControl
          // value={new Date()}
          required={false}
          name="startDate"
          onChange={onSelectDateChange}
          placeholder={'Select date'}
          dateFormat={'YYYY-MM-DD'}
        />
      </CustomRangeContainer>
      {renderWeekDays()}
    </>
  );

  const onContentTypeSelect = contntType => {
    localStorage.setItem('contentType', JSON.stringify(contntType));
    const contType = JSON.parse(localStorage.getItem('contentType') || '[]')
      .value;
    setContentType(contType);
  };

  const renderSwitchContent = () => {
    switch (contentType) {
      case 'By Date Selection':
        return adminConfigBySelect();
      case 'By Date Range':
        return adminConfigByDate();
      default:
        return adminConfigByDay();
    }
  };

  const adminConfigDefaultContent = ({ closeModal }) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SelectTeamMembers
          queryParams={queryParams}
          label={'Team member'}
          onSelect={onUserSelect}
          name="userId"
        />
        <SelectDepartments
          isRequired={false}
          defaultValue={selectedDeptId}
          onChange={onDepartmentSelect}
        />
        <FormGroup>
          <ControlLabel>Branches</ControlLabel>
          <Row>
            <Select
              value={selectedBranchId}
              onChange={onBranchSelect}
              placeholder="Select branch"
              multi={true}
              options={branchesList && renderBranchOptions(branchesList)}
            />
          </Row>
        </FormGroup>
        <Select
          value={contentType}
          onChange={onContentTypeSelect}
          placeholder="Select Content Type"
          options={['By Date Range', 'By Week Day', 'By Date Selection'].map(
            day => ({
              value: day,
              label: __(day)
            })
          )}
        />
        {renderSwitchContent()}
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
          <Button
            style={{ marginTop: 10 }}
            onClick={() => onAdminSubmitClick(closeModal)}
          >
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
        content={adminConfigDefaultContent}
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
              <CustomRow key={shift.shiftEnd} marginNum={10}>
                {new Date(shift.shiftStart).toDateString()}
              </CustomRow>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return (
              <CustomRow key={shift.shiftEnd} marginNum={10}>
                {new Date(shift.shiftStart).toLocaleTimeString()}
              </CustomRow>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return (
              <CustomRow key={shift.shiftEnd} marginNum={10}>
                {new Date(shift.shiftEnd).toLocaleTimeString()}
              </CustomRow>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return shift.solved ? (
              <CustomRow marginNum={10}>{__(shift.status)}</CustomRow>
            ) : (
              <CustomRow marginNum={3}>
                <Button
                  size="small"
                  btnStyle="success"
                  onClick={() => solveShift(shift._id, 'Approved')}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  btnStyle="danger"
                  onClick={() => solveShift(shift._id, 'Rejected')}
                >
                  Reject
                </Button>
              </CustomRow>
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
        {ListShiftContent(
          schedule.shifts.sort(
            (a, b) =>
              new Date(a.shiftStart).getTime() -
              new Date(b.shiftStart).getTime()
          )
        )}
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
      leftSidebar={<SideBarList queryParams={queryParams} history={history} />}
    />
  );
}

export default ScheduleList;
