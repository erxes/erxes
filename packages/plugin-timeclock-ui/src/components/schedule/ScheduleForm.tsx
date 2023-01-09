import Button from '@erxes/ui/src/components/Button';
import React, { useState } from 'react';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import DateRange from '../datepicker/DateRange';
import dayjs from 'dayjs';
import DatePicker from '../datepicker/DateTimePicker';
import { ISchedule } from '../../types';
import Select from 'react-select-plus';
import SelectDepartments from '@erxes/ui-settings/src/departments/containers/SelectDepartments';
import { FlexCenter } from '../../styles';

import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Row } from '../../styles';
import { IBranch } from '@erxes/ui/src/team/types';
import { CustomRangeContainer } from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  scheduleOfMembers: any;
  queryParams: any;
  history: any;
  branchesList: IBranch[];
  modalContentType: string;
  submitRequest: (userId: string[], filledShifts: any) => void;
  submitShift: (userIds: string[], filledShifts: any) => void;
  closeModal: any;
};

function ScheduleForm(props: Props) {
  const {
    queryParams,
    submitRequest,
    submitShift,
    closeModal,
    branchesList,
    modalContentType
  } = props;

  const [dateKeyCounter, setKeyCounter] = useState('');
  const [userIds, setUserIds] = useState(['']);

  const timeFormat = 'HH:mm';
  const [dateRangeStart, setDateStart] = useState(new Date());
  const [dateRangeEnd, setDateEnd] = useState(new Date());
  const [scheduleDates, setScheduleDates] = useState<ISchedule>({});
  const [contentType, setContentType] = useState('By Date Range');
  const [selectedDeptIds, setDepartments] = useState(['']);
  const [selectedBranchIds, setBranches] = useState(['']);

  const renderBranchOptions = (branches: any[]) => {
    return branches.map(branch => ({
      value: branch._id,
      label: branch.title
    }));
  };

  const onBranchSelect = selectedBranch => {
    setBranches(selectedBranch);
  };

  const onDepartmentSelect = dept => {
    setDepartments(dept);
  };

  const onRemoveDate = day_key => {
    delete scheduleDates[day_key];
    setScheduleDates({
      ...scheduleDates
    });
    setKeyCounter(Object.keys(scheduleDates).at(-1) || '');
  };

  const onDateChange = (day_key, selectedDate) => {
    const newShift = scheduleDates[day_key];

    const oldShiftEnd = newShift.shiftEnd;
    const oldShiftStart = newShift.shiftStart;

    const newShiftStart = dayjs(
      selectedDate.toLocaleDateString() +
        ' ' +
        dayjs(oldShiftStart).format(timeFormat)
    ).toDate();
    const newShiftEnd = dayjs(
      selectedDate.toLocaleDateString() +
        ' ' +
        dayjs(oldShiftEnd).format(timeFormat)
    ).toDate();

    newShift.shiftDate = selectedDate;
    newShift.shiftStart = newShiftStart;
    newShift.shiftEnd = newShiftEnd;

    const newScheduleDates = { ...scheduleDates, [day_key]: newShift };
    setScheduleDates(newScheduleDates);
  };

  const compareStartAndEndTime = (day_key, newShiftStart, newShiftEnd) => {
    const currShift = scheduleDates[day_key];
    const currShiftDate = currShift.shiftDate?.toLocaleDateString();
    const currShiftEnd = newShiftEnd ? newShiftEnd : currShift.shiftEnd;
    const currShiftStart = newShiftStart ? newShiftStart : currShift.shiftStart;

    let overnightShift = false;
    let correctShiftEnd;

    if (
      dayjs(currShiftEnd).format(timeFormat) <
      dayjs(currShiftStart).format(timeFormat)
    ) {
      correctShiftEnd =
        dayjs(currShiftDate)
          .add(1, 'day')
          .toDate()
          .toLocaleDateString() +
        ' ' +
        dayjs(currShiftEnd).format(timeFormat);

      overnightShift = true;
    } else {
      correctShiftEnd = dayjs(
        currShiftDate + ' ' + dayjs(currShiftEnd).format(timeFormat)
      ).toDate();
    }

    const correctShiftStart = dayjs(
      currShiftDate + ' ' + dayjs(currShiftStart).format(timeFormat)
    ).toDate();

    return [correctShiftStart, correctShiftEnd, overnightShift];
  };

  const onStartTimeChange = (day_key, time) => {
    const newShift = scheduleDates[day_key];
    const [
      getCorrectStartTime,
      getCorrectEndTime,
      overnight
    ] = compareStartAndEndTime(day_key, time, null);

    newShift.shiftStart = getCorrectStartTime;
    newShift.overnightShift = overnight;
    newShift.shiftEnd = getCorrectEndTime;

    const newScheduleDates = { ...scheduleDates, [day_key]: newShift };
    setScheduleDates(newScheduleDates);
  };

  const onEndTimeChange = (day_key, time) => {
    const newShift = scheduleDates[day_key];
    const [
      getCorrectStartTime,
      getCorrectEndTime,
      overnight
    ] = compareStartAndEndTime(day_key, null, time);

    newShift.shiftStart = getCorrectStartTime;
    newShift.overnightShift = overnight;
    newShift.shiftEnd = getCorrectEndTime;

    const newScheduleDates = { ...scheduleDates, [day_key]: newShift };
    setScheduleDates(newScheduleDates);
  };

  const pickSubset = Object.values(scheduleDates).map(shift => {
    return { shiftStart: shift.shiftStart, shiftEnd: shift.shiftEnd };
  });

  const onSubmitClick = () => {
    submitRequest(userIds, pickSubset);
    closeModal();
  };
  const onAdminSubmitClick = () => {
    submitShift(userIds, pickSubset);
    closeModal();
  };
  const onUserSelect = users => {
    setUserIds(users);
  };

  const clearDays = () => {
    setScheduleDates({});
  };

  const addDay = () => {
    // sort array of dates, in order to get the latest day
    let dates_arr = Object.values(scheduleDates).map(shift => shift.shiftDate);
    dates_arr = dates_arr.sort((a, b) => b.getTime() - a.getTime());

    const dates = scheduleDates;
    const getLatestDayKey = dates_arr
      ? dayjs(dates_arr[0])
          .add(1, 'day')
          .toDate()
          .toLocaleDateString()
      : new Date().toLocaleDateString();

    dates[getLatestDayKey] = {
      shiftDate: new Date(getLatestDayKey),
      shiftStart: new Date(getLatestDayKey + ' 08:30:00'),
      shiftEnd: new Date(getLatestDayKey + ' 17:00:00')
    };

    setScheduleDates({
      ...dates
    });
    setKeyCounter(getLatestDayKey);
  };

  const renderWeekDays = () => {
    return (
      <>
        {Object.keys(scheduleDates).map(date_key => {
          return (
            <DatePicker
              key={date_key}
              startDate={scheduleDates[date_key].shiftDate}
              startTime_value={scheduleDates[date_key].shiftStart}
              endTime_value={scheduleDates[date_key].shiftEnd}
              overnightShift={scheduleDates[date_key].overnightShift}
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

  const actionButtons = (userType: string) => {
    return (
      <FlexCenter>
        <Button style={{ marginTop: 10 }} onClick={clearDays}>
          Clear
        </Button>
        <Button style={{ marginTop: 10 }} onClick={addDay}>
          Add day
        </Button>
        <Button
          btnStyle="success"
          style={{ marginTop: 10 }}
          onClick={() =>
            userType === 'admin' ? onAdminSubmitClick() : onSubmitClick()
          }
        >
          {'Submit'}
        </Button>
      </FlexCenter>
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
      {actionButtons('employee')}
    </div>
  );

  const adminModalContent = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SelectTeamMembers
          queryParams={queryParams}
          label={'Team member'}
          onSelect={onUserSelect}
          name="userId"
        />
        {renderWeekDays()}
        {actionButtons('admin')}
      </div>
    );
  };

  const adminConfigDefaultContent = () => {
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
          defaultValue={selectedDeptIds}
          onChange={onDepartmentSelect}
        />
        <FormGroup>
          <ControlLabel>Branches</ControlLabel>
          <Row>
            <Select
              value={selectedBranchIds}
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
          options={['By Date Range', 'By Date Selection'].map(day => ({
            value: day,
            label: __(day)
          }))}
        />
        {renderAdminConfigSwitchContent()}
        {actionButtons('admin')}
      </div>
    );
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
        shiftDate: new Date(eachDay),
        shiftStart: new Date(eachDay + ' 08:30:00'),
        shiftEnd: new Date(eachDay + ' 17:00:00')
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

  const adminConfigByDateRange = () => {
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

  const onDateSelectChange = dateString => {
    if (dateString) {
      const getDate = new Date(dateString).toDateString();

      const newDates = scheduleDates;

      newDates[getDate] = {
        shiftDate: new Date(getDate),
        shiftStart: new Date(getDate + ' 08:30:00'),
        shiftEnd: new Date(getDate + ' 17:00:00')
      };

      setScheduleDates(newDates);
      setKeyCounter(getDate);
    }
  };

  const adminConfigBySelect = () => (
    <>
      <CustomRangeContainer>
        <DateControl
          required={false}
          name="startDate"
          onChange={onDateSelectChange}
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

  const renderAdminConfigSwitchContent = () => {
    switch (contentType) {
      case 'By Date Selection':
        return adminConfigBySelect();
      default:
        return adminConfigByDateRange();
    }
  };

  switch (modalContentType) {
    case 'admin':
      return adminModalContent();
    case 'adminConfig':
      return adminConfigDefaultContent();
    default:
      return modalContent();
  }
}

export default ScheduleForm;
