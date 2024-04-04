import Button from '@erxes/ui/src/components/Button';
import { Alert, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import { FormControl } from '@erxes/ui/src/components/form';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { IAbsenceType } from '../../types';
import Uploader from '@erxes/ui/src/components/Uploader';
import {
  CustomRangeContainer,
  FlexCenter,
  FlexColumn,
  FlexRow,
  FlexRowEven,
  MarginY,
  ToggleDisplay
} from '../../styles';
import { IAttachment } from '@erxes/ui/src/types';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Datetime from '@nateradebaugh/react-datetime';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { PopoverButton } from '@erxes/ui/src/styles/main';
import Icon from '@erxes/ui/src/components/Icon';
import { dateFormat } from '../../constants';
import * as dayjs from 'dayjs';
import {
  compareStartAndEndTimeOfSingleDate,
  prepareCurrentUserOption
} from '../../utils';
import { IUser } from '@erxes/ui/src/auth/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

type Props = {
  currentUser: IUser;
  departments: IDepartment[];
  branches: IBranch[];

  isCurrentUserAdmin: boolean;

  absenceTypes: IAbsenceType[];
  history: any;
  queryParams: any;

  submitCheckInOut: (type: string, userId: string, dateVal: Date) => void;
  checkInOutRequest?: boolean;

  submitRequest: (
    userId: string,
    reason: string,
    explanation: string,
    attachment: IAttachment,
    timeRange: TimeRange | RequestDates,
    absenceTypeId: string,
    absenceTimeType: string,
    totalHoursOfAbsence: string
  ) => void;
  contentProps: any;
};

type TimeRange = {
  startTime: Date;
  endTime: Date;
};

type RequestDates = {
  requestDates: string[];
};

export default (props: Props) => {
  const {
    currentUser,

    departments,
    branches,

    absenceTypes,
    queryParams,
    submitRequest,
    contentProps,
    checkInOutRequest,
    submitCheckInOut,

    isCurrentUserAdmin
  } = props;

  type RequestByTime = {
    date: Date;
    startTime: Date;
    endTime: Date;
  };

  type Request = {
    byDay: {
      requestDates: string[];
    };

    byTime: RequestByTime;
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

  const { closeModal } = contentProps;

  const [overlayTrigger, setOverlayTrigger] = useState<any>(null);

  const [lastSelectedDate, setlastSelectedDate] = useState(new Date());

  const [request, setRequest] = useState<Request>({
    byDay: { requestDates: [] },
    byTime: { date: new Date(), startTime: new Date(), endTime: new Date() }
  });

  const [checkInOutType, setCheckInOutType] = useState('Check in');
  const [checkInOutDate, setCheckInOutDate] = useState(new Date());

  const [explanation, setExplanation] = useState('');
  const [attachment, setAttachment] = useState<IAttachment>({
    name: ' ',
    type: '',
    url: ''
  });

  const checkAbsenceIdx = parseInt(
    localStorage.getItem('absenceIdx') || '0',
    10
  );

  const [absenceIdx, setAbsenceArrIdx] = useState(
    checkAbsenceIdx < absenceTypes.length ? checkAbsenceIdx : 0
  );

  const [userId, setUserId] = useState('');

  const checkInput = selectedUser => {
    if (selectedUser === '') {
      Alert.error('No user was selected');
    } else if (
      absenceTypes[absenceIdx].attachRequired &&
      attachment.url === ''
    ) {
      Alert.error('No attachment was uploaded');
    } else if (absenceTypes[absenceIdx].explRequired && explanation === '') {
      Alert.error('No explanation was given');
    } else {
      return true;
    }
  };

  const calculateTotalHoursOfAbsence = () => {
    const absenceTimeType = absenceTypes[absenceIdx].requestTimeType;

    if (absenceTimeType === 'by day') {
      const totalRequestedDays = request.byDay.requestDates.length;

      const totalRequestedDaysTime =
        totalRequestedDays * (absenceTypes[absenceIdx].requestHoursPerDay || 0);

      return totalRequestedDaysTime.toFixed(1);
    }

    return (
      (request.byTime.endTime.getTime() - request.byTime.startTime.getTime()) /
      3600000
    ).toFixed(1);
  };

  const onSubmitClick = () => {
    const validInput = checkInput(userId);
    if (validInput) {
      const absenceTimeType = absenceTypes[absenceIdx].requestTimeType;
      const submitTime =
        absenceTimeType === 'by day'
          ? request.byDay
          : {
              startTime: request.byTime.startTime,
              endTime: request.byTime.endTime
            };

      submitRequest(
        userId,
        absenceTypes[absenceIdx].name,
        explanation,
        attachment,
        submitTime,
        absenceTypes[absenceIdx]._id,
        absenceTimeType,
        calculateTotalHoursOfAbsence()
      );
      closeModal();
    }
  };

  const setInputValue = e => {
    setExplanation(e.target.value);
  };

  const onUserSelect = usrId => {
    setUserId(usrId);
  };

  const onReasonSelect = reason => {
    setAbsenceArrIdx(reason.arrayIdx);
  };

  const onChangeAttachment = (files: IAttachment[]) => {
    setAttachment(files[0]);
  };

  const onCheckInDateChange = date => {
    setCheckInOutDate(date);
  };

  const onSubmitCheckInOut = () => {
    submitCheckInOut(checkInOutType, userId, checkInOutDate);
    closeModal();
  };

  const filterParams = isCurrentUserAdmin
    ? {}
    : {
        ids: returnTotalUserOptions(),
        excludeIds: false
      };

  if (checkInOutRequest) {
    return (
      <FlexColumn marginNum={10}>
        <Select
          value={checkInOutType}
          onChange={e => setCheckInOutType(e.value)}
          options={['Check in', 'Check out'].map(ipt => ({
            label: ipt,
            value: ipt
          }))}
        />

        <SelectTeamMembers
          queryParams={queryParams}
          filterParams={filterParams}
          customOption={prepareCurrentUserOption(currentUser)}
          customField="employeeId"
          label={'Team member'}
          onSelect={onUserSelect}
          multi={false}
          name="userId"
        />

        <CustomRangeContainer>
          <DateControl
            required={false}
            value={checkInOutDate}
            name="startDate"
            placeholder={'Starting date'}
            dateFormat="YYYY-MM-DD"
            timeFormat="HH:mm"
            onChange={val => onCheckInDateChange(val)}
          />
        </CustomRangeContainer>

        <FlexCenter>
          <Button btnStyle="primary" onClick={onSubmitCheckInOut}>
            Submit
          </Button>
        </FlexCenter>
      </FlexColumn>
    );
  }

  const closePopover = () => {
    if (overlayTrigger) {
      overlayTrigger.hide();
    }
  };

  const onDateSelectChange = date => {
    if (date) {
      // handle click on a different month
      if (
        JSON.stringify(date).split('-')[1] !==
        JSON.stringify(lastSelectedDate).split('-')[1]
      ) {
        setlastSelectedDate(new Date(date));
      }

      const dateString = dayjs(date).format(dateFormat);

      const oldRequestDates = request.byDay.requestDates;
      const findIndex = oldRequestDates.indexOf(dateString);

      if (findIndex !== -1) {
        oldRequestDates.splice(findIndex, 1);
        setRequest({ ...request, byDay: { requestDates: oldRequestDates } });
        return;
      }

      oldRequestDates.push(dateString);
      setRequest({ ...request, byDay: { requestDates: oldRequestDates } });
    }
  };

  const renderDay = (dateTimeProps: any, currentDate) => {
    let isSelected = false;

    const dateString = dayjs(currentDate).format(dateFormat);

    if (request.byDay.requestDates.indexOf(dateString) !== -1) {
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
            renderDay={renderDay}
            value={lastSelectedDate}
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

  const onDateChange = selectedDate => {
    const [
      getCorrectStartTime,
      getCorrectEndTime
    ] = compareStartAndEndTimeOfSingleDate(
      request.byTime.startTime,
      request.byTime.endTime,
      selectedDate
    );

    setRequest({
      ...request,
      byTime: {
        date: new Date(selectedDate),
        endTime: getCorrectEndTime,
        startTime: getCorrectStartTime
      }
    });
  };

  const onChangeStartTime = starTimeValue => {
    const [
      getCorrectStartTime,
      getCorrectEndTime
    ] = compareStartAndEndTimeOfSingleDate(
      starTimeValue,
      request.byTime.endTime,
      request.byTime.date
    );

    setRequest({
      ...request,
      byTime: {
        ...request.byTime,
        endTime: getCorrectEndTime,
        startTime: getCorrectStartTime
      }
    });
  };

  const onChangeEndTime = endTimeValue => {
    const [
      getCorrectStartTime,
      getCorrectEndTime
    ] = compareStartAndEndTimeOfSingleDate(
      request.byTime.startTime,
      endTimeValue,
      request.byTime.date
    );

    setRequest({
      ...request,
      byTime: {
        ...request.byTime,
        endTime: getCorrectEndTime,
        startTime: getCorrectStartTime
      }
    });
  };

  const onTimeChange = (input: any, type: string) => {
    const startDate = request.byTime.date;

    const getDate = startDate
      ? startDate.toLocaleDateString()
      : new Date().toLocaleDateString();
    const validateInput = dayjs(getDate + ' ' + input).toDate();

    if (
      input instanceof Date &&
      startDate?.getUTCFullYear() === input.getUTCFullYear()
    ) {
      if (type === 'start') {
        onChangeStartTime(input);
      } else {
        onChangeEndTime(input);
      }
    }

    if (!isNaN(validateInput.getTime())) {
      if (type === 'start') {
        onChangeStartTime(validateInput);
      } else {
        onChangeEndTime(validateInput);
      }
    }
  };

  const renderDateAndTimeSelection = (
    <FlexRowEven>
      <FlexColumn marginNum={2}>
        <div>Date:</div>
        <Datetime
          value={request.byTime.date}
          timeFormat={false}
          onChange={onDateChange}
        />
      </FlexColumn>

      <FlexColumn marginNum={2}>
        <div>From:</div>
        <Datetime
          value={request.byTime.startTime}
          dateFormat={false}
          timeFormat="HH:mm"
          timeConstraints={{
            hours: { min: 0, max: 24, step: 1 }
          }}
          onChange={val => onTimeChange(val, 'start')}
        />
      </FlexColumn>
      <FlexColumn marginNum={2}>
        <div>To:</div>
        <Datetime
          value={request.byTime.endTime}
          dateFormat={false}
          timeFormat="HH:mm"
          onChange={val => onTimeChange(val, 'end')}
        />
      </FlexColumn>
    </FlexRowEven>
  );

  const requestTimeByDay =
    absenceTypes[absenceIdx].requestTimeType === 'by day';

  const renderTotalRequestTime = () => {
    const totalRequestedDays = request.byDay.requestDates.length;

    if (requestTimeByDay) {
      return (
        <FlexRow>
          <FlexColumn marginNum={2}>
            <div>Total days :</div>
            <div>Total hours :</div>
          </FlexColumn>
          <FlexColumn marginNum={2}>
            <div>{totalRequestedDays}</div>
            <div>{calculateTotalHoursOfAbsence()}</div>
          </FlexColumn>
        </FlexRow>
      );
    }

    return (
      <FlexRow>
        <div>Total hours :</div>
        <div> {calculateTotalHoursOfAbsence()}</div>
      </FlexRow>
    );
  };

  return (
    <FlexColumn marginNum={10}>
      <ToggleDisplay display={requestTimeByDay}>
        <OverlayTrigger
          ref={overlay => setOverlayTrigger(overlay)}
          placement="left-start"
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
      </ToggleDisplay>

      <ToggleDisplay display={!requestTimeByDay}>
        {renderDateAndTimeSelection}
      </ToggleDisplay>

      <MarginY margin={15}>
        <FlexCenter>
          <div style={{ fontSize: '14px', width: '30%' }}>
            {renderTotalRequestTime()}
          </div>
        </FlexCenter>
      </MarginY>
      <SelectTeamMembers
        customField="employeeId"
        filterParams={filterParams}
        customOption={prepareCurrentUserOption(currentUser)}
        queryParams={queryParams}
        label={'Team member'}
        onSelect={onUserSelect}
        multi={false}
        name="userId"
      />

      <Select
        placeholder={__('Reason')}
        onChange={onReasonSelect}
        value={absenceTypes.length > 0 && absenceTypes[absenceIdx].name}
        options={
          absenceTypes &&
          absenceTypes.map((absenceType, idx) => ({
            value: absenceType.name,
            label: absenceType.name,
            arrayIdx: idx
          }))
        }
      />
      {absenceTypes.length > 0 && absenceTypes[absenceIdx].explRequired ? (
        <FormControl
          type="text"
          name="reason"
          placeholder="Please write short explanation"
          onChange={setInputValue}
          required={true}
        />
      ) : (
        <></>
      )}

      {absenceTypes.length > 0 && absenceTypes[absenceIdx].attachRequired ? (
        <Uploader
          text={`Choose a file to upload`}
          warningText={'Only .jpg or jpeg file is supported.'}
          single={true}
          defaultFileList={[]}
          onChange={onChangeAttachment}
        />
      ) : (
        <></>
      )}
      <FlexCenter>
        <Button style={{ marginTop: 10 }} onClick={onSubmitClick}>
          {'Submit'}
        </Button>
      </FlexCenter>
    </FlexColumn>
  );
};
