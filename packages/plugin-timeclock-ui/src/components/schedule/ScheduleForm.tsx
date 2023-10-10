import Button from '@erxes/ui/src/components/Button';
import React, { useState, useEffect } from 'react';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import DateRange from '../datepicker/DateRange';
import dayjs from 'dayjs';
import DatePicker from '../datepicker/DatePicker';
import {
  IScheduleForm,
  IScheduleConfig,
  IScheduleConfigOrder,
  ISchedule
} from '../../types';
import Select from 'react-select-plus';
import SelectDepartments from '@erxes/ui-settings/src/departments/containers/SelectDepartments';
import {
  FlexCenter,
  FlexColumn,
  FlexRow,
  MarginX,
  MarginY,
  SortItem,
  CustomContainer
} from '../../styles';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { PopoverButton } from '@erxes/ui/src/styles/main';
import Icon from '@erxes/ui/src/components/Icon';

import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Row } from '../../styles';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { Alert, __ } from '@erxes/ui/src/utils';
import { compareStartAndEndTime, prepareCurrentUserOption } from '../../utils';
import Datetime from '@nateradebaugh/react-datetime';
import { dateFormat, timeFormat } from '../../constants';
import { IUser } from '@erxes/ui/src/auth/types';
import { FormControl } from '@erxes/ui/src/components/form';

import * as icons from 'react-bootstrap-icons';

type Props = {
  currentUser: IUser;
  isCurrentUserAdmin: boolean;

  branches: IBranch[];
  departments: IDepartment[];

  scheduleOfMember?: any;
  queryParams: any;
  history: any;
  modalContentType: string;
  scheduleConfigs: IScheduleConfig[];
  scheduleConfigOrder?: IScheduleConfigOrder;

  checkDuplicateScheduleShifts: (values: any) => any;
  scheduleConfigOrderEdit: (values: any) => any;
  editSchedule: (scheduleId: string, shifts: any, closeModal: any) => any;

  closeModal: any;
};

function ScheduleForm(props: Props) {
  const {
    currentUser,
    isCurrentUserAdmin,
    closeModal,

    branches,
    departments,

    modalContentType,
    scheduleConfigs,
    scheduleConfigOrder,
    checkDuplicateScheduleShifts,
    scheduleConfigOrderEdit,
    editSchedule,

    scheduleOfMember
  } = props;

  const convertScheduleIntoScheduleForm = (schedule: ISchedule) => {
    const returnObject: IScheduleForm = {};

    schedule?.shifts?.map((shift, i) => {
      returnObject[i] = {
        _id: shift._id,
        shiftDate: new Date(shift.shiftStart),
        shiftStart: new Date(shift.shiftStart),
        shiftEnd: new Date(shift.shiftEnd),
        scheduleConfigId: shift.scheduleConfigId,
        lunchBreakInMins: shift.lunchBreakInMins,
        inputChecked: shift.scheduleConfigId ? false : true
      };
    });

    return returnObject;
  };

  const returnTotalUserOptions = () => {
    const totalUserOptions: string[] = [];

    for (const dept of departments) {
      totalUserOptions.push(...dept.userIds);
    }

    for (const branch of branches) {
      totalUserOptions.push(...branch.userIds);
    }

    if (currentUser) {
      totalUserOptions.push(currentUser._id);
    }

    return totalUserOptions;
  };

  if (!scheduleConfigs) {
    Alert.error('Please add schedule config in configuration section!');
  }

  const filterParams = isCurrentUserAdmin
    ? {}
    : {
        ids: returnTotalUserOptions(),
        excludeIds: false
      };

  // prepare schedule configsObject
  const scheduleConfigsObject = {};

  scheduleConfigs?.map(scheduleConfig => {
    scheduleConfigsObject[scheduleConfig._id] = scheduleConfig;
  });

  const [scheduleConfigsOrderData, setScheduleConfigsOrderData] = useState({
    userId: currentUser._id,
    orderedList: scheduleConfigOrder
      ? scheduleConfigOrder.orderedList
      : scheduleConfigs.map((s, index) => ({
          scheduleConfigId: s._id,
          order: index,
          pinned: false,
          label: `${s.shiftStart} ~ ${s.shiftEnd}\xa0\xa0\xa0(${s.scheduleName})`
        }))
  });

  const [inputDefaultChecked, setInputDefaultChecked] = useState(false);

  const [selectedScheduleConfigId, setScheduleConfigId] = useState(
    scheduleConfigsOrderData.orderedList[0].scheduleConfigId
  );

  const [lastSelectedDate, setlastSelectedDate] = useState(new Date());

  const [scheduleId, setScheduleId] = useState(scheduleOfMember?._id);

  const [defaultStartTime, setDefaultStartTime] = useState(
    scheduleConfigsObject[selectedScheduleConfigId].shiftStart
  );
  const [defaultEndTime, setDefaultEndTime] = useState(
    scheduleConfigsObject[selectedScheduleConfigId].shiftEnd
  );

  const [dateRangeStart, setDateStart] = useState(new Date());
  const [dateRangeEnd, setDateEnd] = useState(new Date());

  const [scheduleDates, setScheduleDates] = useState<IScheduleForm>(
    convertScheduleIntoScheduleForm(scheduleOfMember)
  );

  const [scheduleDaysLastIdx, setScheduleDaysLastIdx] = useState(
    Object.keys(scheduleDates).length
      ? Object.keys(scheduleDates).length + 1
      : 0
  );

  const [contentType, setContentType] = useState('By Date Range');

  const [userIds, setUserIds] = useState(
    scheduleOfMember?.user?._id ? [scheduleOfMember?.user?._id] : []
  );

  const [departmentIds, setDepartmentIds] = useState([]);
  const [branchIds, setBranchIds] = useState([]);

  const [showScheduleConfigOrder, setShowScheduleConfigOrder] = useState(false);

  const [overlayTrigger, setOverlayTrigger] = useState<any>(null);

  useEffect(() => {
    setScheduleConfigId(
      scheduleConfigsOrderData.orderedList[0].scheduleConfigId
    );
  }, [scheduleConfigsOrderData]);

  const renderBranchOptions = (branchesList: any[]) => {
    return branchesList.map(branch => ({
      value: branch._id,
      label: branch.title,
      userIds: branch.userIds
    }));
  };

  const renderScheduleConfigOptions = () => {
    return scheduleConfigsOrderData.orderedList.map(s => ({
      value: s.scheduleConfigId,
      label: s.label
    }));
  };

  // change schedule for all days
  const onScheduleConfigSelectForAll = scheduleConfig => {
    const selectedScheduleConfidId = scheduleConfig.value;

    setScheduleConfigId(selectedScheduleConfidId);

    setDefaultStartTime(
      scheduleConfigsObject[selectedScheduleConfidId].shiftStart
    );
    setDefaultEndTime(scheduleConfigsObject[selectedScheduleConfidId].shiftEnd);

    Object.keys(scheduleDates).forEach(day_key => {
      if (scheduleDates[day_key].inputChecked) {
        return;
      }
      const shiftDay = scheduleDates[day_key].shiftDate;

      const getShiftStart = dayjs(
        shiftDay?.toLocaleDateString() +
          ' ' +
          scheduleConfigsObject[selectedScheduleConfidId].shiftStart
      ).toDate();

      const getShiftEnd = dayjs(
        shiftDay?.toLocaleDateString() +
          ' ' +
          scheduleConfigsObject[selectedScheduleConfidId].shiftEnd
      ).toDate();

      const [
        getCorrectShiftStart,
        getCorrectShiftEnd,
        overNightShift
      ] = compareStartAndEndTime(
        scheduleDates,
        day_key,
        getShiftStart,
        getShiftEnd
      );
      scheduleDates[day_key].shiftStart = getCorrectShiftStart;
      scheduleDates[day_key].shiftEnd = getCorrectShiftEnd;
      scheduleDates[day_key].overnightShift = overNightShift;
      scheduleDates[day_key].scheduleConfigId = selectedScheduleConfidId;
    });

    setScheduleDates({ ...scheduleDates });
  };

  const onBranchSelect = selectedBranch => {
    const selectedBranchIds: any = [];
    selectedBranchIds.push(...selectedBranch.map(branch => branch.value));
    setBranchIds(selectedBranchIds);
  };

  const onDepartmentSelect = dept => {
    setDepartmentIds(dept);
  };

  const onRemoveDate = day_key => {
    delete scheduleDates[day_key];
    setScheduleDates({
      ...scheduleDates
    });
  };

  const onDateChange = (day_key, selectedDate) => {
    const oldShift = scheduleDates[day_key];
    const oldShiftStart = oldShift.shiftStart;
    const oldShiftEnd = oldShift.shiftEnd;

    const [getShiftStart, getShiftEnd, overnight] = compareStartAndEndTime(
      scheduleDates,
      day_key,
      oldShiftStart,
      oldShiftEnd
    );

    const newShift = {
      ...oldShift,
      shiftDate: selectedDate,
      shiftStart: getShiftStart,
      shiftEnd: getShiftEnd,
      overnightShift: overnight
    };

    delete scheduleDates[day_key];

    const newScheduleDates = { ...scheduleDates, [day_key]: newShift };

    setScheduleDates(newScheduleDates);
  };

  const pickSubset = Object.values(scheduleDates).map(shift => {
    return {
      _id: shift._id,
      shiftStart: shift.shiftStart,
      shiftEnd: shift.shiftEnd,
      scheduleConfigId: shift.inputChecked ? null : shift.scheduleConfigId,
      lunchBreakInMins: shift.lunchBreakInMins
    };
  });

  const calculateScheduledDaysAndHours = () => {
    const totalDays = Object.keys(scheduleDates).length;
    let totalHours = 0;

    pickSubset.forEach(shift => {
      totalHours +=
        (shift.shiftEnd.getTime() - shift.shiftStart.getTime()) / (1000 * 3600);
    });

    let totalBreakMins = 0;

    for (const scheduledDateIdx of Object.keys(scheduleDates)) {
      totalBreakMins += scheduleDates[scheduledDateIdx].lunchBreakInMins || 0;
    }

    return [
      totalDays,
      (totalHours - totalBreakMins / 60).toFixed(1),
      totalBreakMins
    ];
  };

  // const onScheduleEdit = async () => {
  //   const checkDuplicateShifts = await checkDuplicateScheduleShifts({
  //     branchIds,
  //     departmentIds,
  //     userIds,
  //     shifts: pickSubset,
  //     checkOnly: true,
  //     status: 'Approved'
  //   });

  //   if (!checkDuplicateShifts.length) {
  //     editSchedule(scheduleId, pickSubset);
  //   }
  // };

  const onSubmitClick = () => {
    if (scheduleId) {
      editSchedule(scheduleId, pickSubset, closeModal);
      return;
    }

    checkDuplicateScheduleShifts({
      branchIds,
      departmentIds,
      userIds,
      shifts: pickSubset,
      totalBreakInMins: calculateScheduledDaysAndHours()[2],
      userType: 'employee',
      closeModal
    });
  };

  const onAdminSubmitClick = () => {
    if (scheduleId) {
      editSchedule(scheduleId, pickSubset, closeModal);
      return;
    }

    checkDuplicateScheduleShifts({
      branchIds,
      departmentIds,
      userIds,
      shifts: pickSubset,
      totalBreakInMins: calculateScheduledDaysAndHours()[2],
      userType: 'admin',
      closeModal,
      status: 'Approved'
    });
  };

  const onUserSelect = users => {
    setUserIds(users);
  };

  const clearDays = () => {
    setScheduleDates({});
    setScheduleDaysLastIdx(0);
  };

  const addDay = () => {
    // sort array of dates, in order to get the latest day
    let dates_arr = Object.values(scheduleDates).map(shift => shift.shiftDate);
    dates_arr = dates_arr.sort(
      (a, b) => (b?.getTime() || 0) - (a?.getTime() || 0)
    );

    const prevScheduleDates = scheduleDates;

    const getLatestDayKey = dates_arr.length
      ? dayjs(dates_arr[0])
          .add(1, 'day')
          .toDate()
          .toLocaleDateString()
      : new Date().toLocaleDateString();

    const [
      getCorrectShiftStart,
      getCorrectShiftEnd,
      overnight
    ] = compareStartAndEndTime(
      scheduleDates,
      getLatestDayKey,
      new Date(getLatestDayKey + ' ' + defaultStartTime),
      new Date(getLatestDayKey + ' ' + defaultEndTime)
    );

    prevScheduleDates[scheduleDaysLastIdx] = {
      shiftDate: new Date(getLatestDayKey),
      shiftStart: getCorrectShiftStart,
      shiftEnd: getCorrectShiftEnd,
      overnightShift: overnight,
      scheduleConfigId: selectedScheduleConfigId,
      lunchBreakInMins:
        scheduleConfigsObject[selectedScheduleConfigId].lunchBreakInMins,
      inputChecked: inputDefaultChecked
    };

    setScheduleDaysLastIdx(scheduleDaysLastIdx + 1);

    setScheduleDates({
      ...prevScheduleDates
    });
  };

  const onScheduleConfigChange = (
    curr_day_key: string,
    scheduleConfigId: string
  ) => {
    const prevScheduleDates = scheduleDates;

    const shiftDate = dayjs(scheduleDates[curr_day_key].shiftDate).format(
      dateFormat
    );

    const [
      getCorrectShiftStart,
      getCorrectShiftEnd,
      overnight
    ] = compareStartAndEndTime(
      scheduleDates,
      shiftDate,
      new Date(
        shiftDate + ' ' + scheduleConfigsObject[scheduleConfigId].shiftStart
      ),
      new Date(
        shiftDate + ' ' + scheduleConfigsObject[scheduleConfigId].shiftEnd
      )
    );

    prevScheduleDates[curr_day_key] = {
      _id: scheduleDates[curr_day_key]._id,
      shiftDate: scheduleDates[curr_day_key].shiftDate,
      shiftStart: getCorrectShiftStart,
      shiftEnd: getCorrectShiftEnd,
      overnightShift: overnight,
      scheduleConfigId,
      lunchBreakInMins: scheduleConfigsObject[scheduleConfigId].lunchBreakInMins
    };

    setScheduleDates({
      ...prevScheduleDates
    });

    setScheduleConfigId(scheduleConfigId);
    setDefaultStartTime(scheduleConfigsObject[scheduleConfigId].shiftStart);
    setDefaultEndTime(scheduleConfigsObject[scheduleConfigId].shiftEnd);
  };

  const onInputCheckedChange = (curr_day_key: string, checked: boolean) => {
    const prevScheduleDates = scheduleDates;
    prevScheduleDates[curr_day_key].inputChecked = checked;

    setScheduleDates({ ...prevScheduleDates });
  };

  const changeScheduleTime = (day_key: string, type: string, timeVal: Date) => {
    const prevScheduleDates = scheduleDates;
    const getDate = dayjs(scheduleDates[day_key].shiftDate).format(dateFormat);
    const getTime = dayjs(timeVal).format(timeFormat);

    if (type === 'start') {
      const [
        correctShiftStart,
        correctShiftEnd,
        isOvernightShift
      ] = compareStartAndEndTime(
        scheduleDates,
        day_key,
        new Date(getDate + ' ' + getTime),
        new Date(
          getDate +
            ' ' +
            dayjs(scheduleDates[day_key].shiftEnd).format(timeFormat)
        ),
        getDate
      );

      prevScheduleDates[day_key].shiftStart = correctShiftStart;
      prevScheduleDates[day_key].shiftEnd = correctShiftEnd;
      prevScheduleDates[day_key].overnightShift = isOvernightShift;
    } else {
      const [
        correctShiftStart,
        correctShiftEnd,
        isOvernightShift
      ] = compareStartAndEndTime(
        scheduleDates,
        day_key,
        new Date(
          getDate +
            ' ' +
            dayjs(scheduleDates[day_key].shiftStart).format(timeFormat)
        ),
        new Date(getDate + ' ' + getTime),
        getDate
      );
      prevScheduleDates[day_key].shiftStart = correctShiftStart;
      prevScheduleDates[day_key].shiftEnd = correctShiftEnd;
      prevScheduleDates[day_key].overnightShift = isOvernightShift;
    }

    setScheduleDates({ ...prevScheduleDates });
  };

  const changeScheduleBreak = (day_key: string, lunchBreakInMins: number) => {
    const prev_scheduled_dates = scheduleDates;

    prev_scheduled_dates[day_key].lunchBreakInMins = lunchBreakInMins;

    setScheduleDates({ ...prev_scheduled_dates });
  };

  const renderWeekDays = () => {
    return (
      <FlexColumn marginNum={5}>
        {Object.keys(scheduleDates).map(i => {
          return (
            <DatePicker
              key={i}
              scheduledDate={scheduleDates[i]}
              selectedScheduleConfigId={scheduleDates[i].scheduleConfigId}
              scheduleConfigOptions={renderScheduleConfigOptions()}
              curr_day_key={i.toString()}
              changeDate={onDateChange}
              removeDate={onRemoveDate}
              changeScheduleConfig={onScheduleConfigChange}
              onInputCheckedChange={onInputCheckedChange}
              inputDefaultChecked={inputDefaultChecked}
              changeScheduleTime={changeScheduleTime}
              changeScheduleBreak={changeScheduleBreak}
            />
          );
        })}
      </FlexColumn>
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

  const dateSelection = () => (
    <FlexColumn marginNum={20}>
      <FlexRow>
        <div style={{ width: '60%' }}>
          <OverlayTrigger
            ref={overlay => setOverlayTrigger(overlay)}
            placement="top-start"
            trigger="click"
            overlay={renderDateSelection()}
            container={this}
            rootClose={this}
          >
            <PopoverButton>
              {__('Please select date')}
              <Icon icon="angle-down" />
            </PopoverButton>
          </OverlayTrigger>
        </div>
        {displayStartEndBreak}
      </FlexRow>
    </FlexColumn>
  );

  const modalContent = () => (
    <FlexColumn marginNum={10}>
      <SelectTeamMembers
        customField="employeeId"
        filterParams={filterParams}
        initialValue={userIds}
        customOption={prepareCurrentUserOption(currentUser)}
        label={'Team member'}
        onSelect={onUserSelect}
        multi={false}
        name="userId"
      />
      {displayTotalDaysHoursBreakMins()}
      {scheduleConfitOrderBox}
      {showScheduleConfigOrder && scheduleConfigOrderContent}
      <FormGroup>
        <ControlLabel>Select schedule for all</ControlLabel>
        <Select
          options={renderScheduleConfigOptions()}
          onChange={onScheduleConfigSelectForAll}
          multi={false}
          value={selectedScheduleConfigId}
        />
      </FormGroup>
      {dateSelection()}
      {renderWeekDays()}
      {actionButtons('employee')}
    </FlexColumn>
  );

  const displayTotalDaysHoursBreakMins = () => {
    let totalBreakMins = 0;

    for (const scheduledDateIdx of Object.keys(scheduleDates)) {
      totalBreakMins += scheduleDates[scheduledDateIdx].lunchBreakInMins || 0;
    }

    return (
      <FlexCenter>
        <div style={{ width: '35%' }}>
          <FlexRow>
            <MarginX margin={20}>
              <FlexColumn marginNum={0}>
                <div>Total days :</div>
                <div>Total hours :</div>
                <div>Total break:</div>
              </FlexColumn>
            </MarginX>
            <FlexColumn marginNum={0}>
              <div>{calculateScheduledDaysAndHours()[0]}</div>
              <div>{calculateScheduledDaysAndHours()[1]}</div>
              <div>{(totalBreakMins / 60).toFixed(1)}</div>
            </FlexColumn>
          </FlexRow>
        </div>
      </FlexCenter>
    );
  };

  const omitTypeName = (scheduleConfigOrderData: IScheduleConfigOrder) => {
    const orderData = scheduleConfigOrderData;

    return {
      userId: orderData.userId,
      orderedList: orderData.orderedList.map(s => ({
        order: s.order,
        scheduleConfigId: s.scheduleConfigId,
        pinned: s.pinned,
        label: s.label
      }))
    };
  };

  const scheduleConfigOrderDataEdit = (scheduleConfigOrderData: any) => {
    setScheduleConfigsOrderData(scheduleConfigOrderData);
    scheduleConfigOrderEdit(omitTypeName(scheduleConfigOrderData));
  };

  const unpinScheduleConfig = (currentConfigOrder: number) => {
    let firstUnpinnedOrderNum = scheduleConfigsOrderData.orderedList.length;

    const newScheduleConfigsOrderData = scheduleConfigsOrderData;

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (!scheduleConfigsOrderItem.pinned) {
        firstUnpinnedOrderNum = scheduleConfigsOrderItem.order;
        break;
      }
    }

    const lastPinnedOrderNum = firstUnpinnedOrderNum - 1;

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (scheduleConfigsOrderItem.order < currentConfigOrder) {
        continue;
      }

      if (scheduleConfigsOrderItem.order > lastPinnedOrderNum) {
        break;
      }

      if (scheduleConfigsOrderItem.order === currentConfigOrder) {
        scheduleConfigsOrderItem.order = lastPinnedOrderNum;
        scheduleConfigsOrderItem.pinned = false;
        continue;
      }
      scheduleConfigsOrderItem.order = scheduleConfigsOrderItem.order - 1;
    }

    scheduleConfigOrderDataEdit({ ...newScheduleConfigsOrderData });
  };

  const pinScheduleConfig = (currentConfigOrder: number) => {
    let firstUnpinnedOrderNum = 0;

    const newScheduleConfigsOrderData = scheduleConfigsOrderData;

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (!scheduleConfigsOrderItem.pinned) {
        firstUnpinnedOrderNum = scheduleConfigsOrderItem.order;
        break;
      }
    }

    const lastPinnedOrderNum = firstUnpinnedOrderNum - 1;

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (scheduleConfigsOrderItem.order > currentConfigOrder) {
        break;
      }

      if (scheduleConfigsOrderItem.order <= lastPinnedOrderNum) {
        continue;
      }

      if (scheduleConfigsOrderItem.order === currentConfigOrder) {
        scheduleConfigsOrderItem.order = firstUnpinnedOrderNum;
        scheduleConfigsOrderItem.pinned = true;
        continue;
      }
      scheduleConfigsOrderItem.order = scheduleConfigsOrderItem.order + 1;
    }

    scheduleConfigOrderDataEdit({ ...newScheduleConfigsOrderData });
  };

  const scheduleConfitOrderBox = (
    <CustomContainer
      onClick={() => setShowScheduleConfigOrder(!showScheduleConfigOrder)}
    >
      <ControlLabel>Select schedule configs order</ControlLabel>
      <MarginX margin={5}>
        {showScheduleConfigOrder ? (
          <Icon icon="angle-down" />
        ) : (
          <Icon icon="angle-right" />
        )}
      </MarginX>
    </CustomContainer>
  );
  const scheduleConfigOrderContent = (
    <>
      {scheduleConfigsOrderData.orderedList
        .sort((a, b) => a.order - b.order)
        .map((s: any) => (
          <SortItem key={s.order}>
            <div>{s.label}</div>
            {s.pinned ? (
              <icons.PinFill
                color="#673FBD"
                onClick={() => unpinScheduleConfig(s.order)}
              />
            ) : (
              <icons.Pin onClick={() => pinScheduleConfig(s.order)} />
            )}
          </SortItem>
        ))}
    </>
  );

  const adminConfigDefaultContent = () => {
    return (
      <FlexColumn marginNum={10}>
        <div style={{ marginBottom: '0' }}>
          <SelectDepartments
            disabled={scheduleId ? true : false}
            isRequired={false}
            defaultValue={departmentIds}
            onChange={onDepartmentSelect}
          />
        </div>
        <FormGroup>
          <div style={{ marginBottom: '0' }}>
            <ControlLabel>Branches</ControlLabel>
            <Row>
              <Select
                disabled={scheduleId ? true : false}
                value={branchIds}
                onChange={onBranchSelect}
                placeholder="Select branch"
                multi={true}
                options={branches && renderBranchOptions(branches)}
              />
            </Row>
          </div>
        </FormGroup>
        <FormGroup>
          <div style={{ marginBottom: '0' }}>
            <ControlLabel>Team members </ControlLabel>
            <div style={{ width: '100%' }}>
              <SelectTeamMembers
                customField="employeeId"
                filterParams={filterParams}
                customOption={prepareCurrentUserOption(currentUser)}
                initialValue={userIds}
                label={'Select team member'}
                onSelect={onUserSelect}
                name="userId"
              />
            </div>
          </div>
        </FormGroup>
        {scheduleConfitOrderBox}
        {showScheduleConfigOrder && scheduleConfigOrderContent}

        <FormGroup>
          <ControlLabel>Select schedule for all</ControlLabel>
          <Select
            options={renderScheduleConfigOptions()}
            onChange={onScheduleConfigSelectForAll}
            multi={false}
            value={selectedScheduleConfigId}
          />
        </FormGroup>

        <FormGroup>
          <FlexRow>
            <ControlLabel>Input default checked</ControlLabel>
            <FormControl
              name="inputDefaultChecked"
              componentClass="checkbox"
              onChange={() => {
                setInputDefaultChecked(!inputDefaultChecked);
              }}
            />
          </FlexRow>
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

        <MarginY margin={20}>{displayTotalDaysHoursBreakMins()}</MarginY>
        {renderAdminConfigSwitchContent()}
        {actionButtons('admin')}
      </FlexColumn>
    );
  };

  const onDateRangeStartChange = (newStart: Date) => {
    setDateStart(newStart);
  };

  const onDateRangeEndChange = (newEnd: Date) => {
    setDateEnd(newEnd);
  };

  const onSaveDateRange = () => {
    const totalDatesArray: string[] = [];

    let temp = dayjs(dateRangeStart);

    const endRange = dayjs(dateRangeEnd);

    while (temp <= endRange) {
      totalDatesArray.push(temp.format(dateFormat));
      temp = temp.add(1, 'day');
    }

    const newDatesByRange: IScheduleForm = {};

    let totalDaysAdded = 0;

    // tslint:disable-next-line:prefer-for-of
    for (let dayIdx = 0; dayIdx < totalDatesArray.length; dayIdx++) {
      const eachDay = totalDatesArray[dayIdx];

      // if date exists already
      if (
        Object.values(scheduleDates).find(
          scheduleDateValues =>
            dayjs(scheduleDateValues.shiftDate).format(dateFormat) === eachDay
        )
      ) {
        continue;
      }
      const [
        correctShiftStart,
        correctShiftEnd,
        isOvernightShift
      ] = compareStartAndEndTime(
        scheduleDates,
        eachDay,
        new Date(eachDay + ' ' + defaultStartTime),
        new Date(eachDay + ' ' + defaultEndTime),
        eachDay
      );

      newDatesByRange[scheduleDaysLastIdx + dayIdx] = {
        shiftDate: new Date(eachDay),
        shiftStart: correctShiftStart,
        scheduleConfigId: selectedScheduleConfigId,
        lunchBreakInMins:
          scheduleConfigsObject[selectedScheduleConfigId].lunchBreakInMins,
        shiftEnd: correctShiftEnd,
        overnightShift: isOvernightShift
      };

      totalDaysAdded += 1;
    }

    setScheduleDates({ ...newDatesByRange, ...scheduleDates });
    setScheduleDaysLastIdx(scheduleDaysLastIdx + totalDaysAdded);
  };

  const displayStartEndBreak = (
    <FlexRow style={{ width: '40%' }}>
      <ControlLabel>{__('Start:')} </ControlLabel>
      <ControlLabel>{__('End:')} </ControlLabel>
      <ControlLabel>{__('Break:')} </ControlLabel>
      <ControlLabel>{__('Input:')} </ControlLabel>
      <ControlLabel>{__('Delete:')} </ControlLabel>
    </FlexRow>
  );
  const adminConfigByDateRange = () => {
    return (
      <FlexColumn marginNum={20}>
        <FlexRow>
          <div style={{ width: '60%' }}>
            <DateRange
              showTime={false}
              startDate={dateRangeStart}
              endDate={dateRangeEnd}
              onChangeEnd={onDateRangeEndChange}
              onChangeStart={onDateRangeStartChange}
              onSaveButton={onSaveDateRange}
            />
          </div>
          {displayStartEndBreak}
        </FlexRow>
        {renderWeekDays()}
      </FlexColumn>
    );
  };

  const onDateSelectChange = dateString => {
    if (dateString) {
      // handle click on a different month
      if (
        JSON.stringify(dateString).split('-')[1] !==
        JSON.stringify(lastSelectedDate).split('-')[1]
      ) {
        setlastSelectedDate(new Date(dateString));
      }

      const getDate = dayjs(dateString).format(dateFormat);

      // if date is already selected remove from schedule date
      for (const scheduleDateIdx of Object.keys(scheduleDates)) {
        if (
          dayjs(scheduleDates[scheduleDateIdx].shiftDate).format(dateFormat) ===
          getDate
        ) {
          delete scheduleDates[scheduleDateIdx];
          setScheduleDates({
            ...scheduleDates
          });
          return;
        }
      }

      const newDates = scheduleDates;

      const [
        correctShiftStart,
        correctShiftEnd,
        isOvernightShift
      ] = compareStartAndEndTime(
        scheduleDates,
        getDate,
        new Date(getDate + ' ' + defaultStartTime),
        new Date(getDate + ' ' + defaultEndTime),
        getDate
      );

      newDates[scheduleDaysLastIdx] = {
        shiftDate: new Date(getDate),
        shiftStart: correctShiftStart,
        shiftEnd: correctShiftEnd,
        overnightShift: isOvernightShift,
        scheduleConfigId: selectedScheduleConfigId,
        lunchBreakInMins:
          scheduleConfigsObject[selectedScheduleConfigId].lunchBreakInMins
      };

      setScheduleDaysLastIdx(scheduleDaysLastIdx + 1);
      setScheduleDates({ ...newDates });
    }
  };

  const closePopover = () => {
    if (overlayTrigger) {
      overlayTrigger.hide();
    }
  };

  const renderDay = (dateTimeProps: any, currentDate) => {
    let isSelected = false;

    const getDate = dayjs(currentDate).format(dateFormat);

    if (
      Object.values(scheduleDates).find(
        scheduleDateValues =>
          dayjs(scheduleDateValues.shiftDate).format(dateFormat) === getDate
      )
    ) {
      isSelected = true;
    }

    return (
      <td
        {...dateTimeProps}
        className={`rdtDay ${isSelected ? 'rdtActive' : ''}`}
      >
        {new Date(currentDate).getDate()}
      </td>
    );
  };

  const renderDateSelection = () => {
    return (
      <Popover id="schedule-date-select-popover" content={true}>
        <div style={{ position: 'relative' }}>
          <Datetime
            open={true}
            input={false}
            value={lastSelectedDate}
            renderDay={renderDay}
            closeOnSelect={false}
            timeFormat={false}
            onChange={onDateSelectChange}
            inputProps={{ required: false }}
          />
          <FlexCenter>
            <MarginY margin={10}>
              <Button onClick={closePopover}>Close</Button>
            </MarginY>
          </FlexCenter>
        </div>
      </Popover>
    );
  };

  const adminConfigBySelect = () => (
    <FlexColumn marginNum={20}>
      <FlexRow>
        <div style={{ width: '60%' }}>
          <OverlayTrigger
            ref={overlay => setOverlayTrigger(overlay)}
            placement="top-start"
            trigger="click"
            overlay={renderDateSelection()}
            container={this}
            rootClose={this}
          >
            <PopoverButton>
              {__('Please select date')}
              <Icon icon="angle-down" />
            </PopoverButton>
          </OverlayTrigger>
        </div>
        {displayStartEndBreak}
      </FlexRow>
      {renderWeekDays()}
    </FlexColumn>
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
    case 'adminConfig':
      return adminConfigDefaultContent();
    default:
      return modalContent();
  }
}

export default ScheduleForm;
