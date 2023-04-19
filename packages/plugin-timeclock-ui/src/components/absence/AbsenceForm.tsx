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
import DateTimePicker from '../datepicker/DateTimePicker';
import { dateFormat } from '../../constants';
import * as dayjs from 'dayjs';

type Props = {
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
    dateRange: DateTimeRange,
    absenceTypeId: string
  ) => void;
  contentProps: any;
};

type DateTimeRange = {
  startTime: Date;
  endTime: Date;
};

type RequestDates = {
  dates?: Date[];
};

export default (props: Props) => {
  const {
    absenceTypes,
    queryParams,
    submitRequest,
    contentProps,
    checkInOutRequest,
    submitCheckInOut
  } = props;

  const { closeModal } = contentProps;

  const [overlayTrigger, setOverlayTrigger] = useState<any>(null);

  const [requestDates, setRequestDates] = useState<string[]>([]);

  const [dateRange, setDateRange] = useState<DateTimeRange>({
    startTime: new Date(localStorage.getItem('dateRangeStart') || ''),
    endTime: new Date(localStorage.getItem('dateRangeEnd') || '')
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
  const onSubmitClick = () => {
    const validInput = checkInput(userId);
    if (validInput) {
      submitRequest(
        userId,
        absenceTypes[absenceIdx].name,
        explanation,
        attachment,
        dateRange,
        absenceTypes[absenceIdx]._id
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

  const onDateRangeStartChange = (newStart: Date) => {
    const newRange = dateRange;
    newRange.startTime = newStart;
    setDateRange({ ...newRange });
  };

  const onDateRangeEndChange = (newEnd: Date) => {
    const newRange = dateRange;
    newRange.endTime = newEnd;
    setDateRange({ ...newRange });
  };

  const onCheckInDateChange = date => {
    setCheckInOutDate(date);
  };

  const onSaveDateRange = () => {
    localStorage.setItem('dateRangeEnd', dateRange.endTime.toISOString());
    localStorage.setItem('dateRangeStart', dateRange.startTime.toISOString());
    Alert.success('succesfully saved');
  };

  const onSubmitCheckInOut = () => {
    submitCheckInOut(checkInOutType, userId, checkInOutDate);
    closeModal();
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
      const dateString = dayjs(date).format(dateFormat);

      const findIndex = requestDates.indexOf(dateString);

      if (findIndex !== -1) {
        requestDates.splice(findIndex, 1);
        setRequestDates([...requestDates]);
        return;
      }

      requestDates.push(dateString);
      setRequestDates([...requestDates]);
    }
  };

  const renderDay = (dateTimeProps: any, currentDate) => {
    let isSelected = false;

    const dateString = dayjs(currentDate).format(dateFormat);

    if (requestDates.indexOf(dateString) !== -1) {
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
            closeOnSelect={false}
            timeFormat={false}
            onChange={onDateSelectChange}
            inputProps={{ required: false }}
          />
          <FlexCenter>
            <MarginY>
              <Button onClick={closePopover}>Close</Button>
            </MarginY>
          </FlexCenter>
        </div>
      </Popover>
    );
  };

  const onDateChange = () => {};

  const onChangeStartTime = () => {};

  const onChangeEndTime = () => {};

  const renderDateAndTimeSelection = () => {
    return (
      <DateTimePicker
        curr_day_key="1"
        changeDate={onDateChange}
        changeStartTime={onChangeStartTime}
        changeEndTime={onChangeEndTime}
      />
    );
  };

  const requestTimeByDay =
    absenceTypes[absenceIdx].requestTimeType === 'by day';

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

      <ToggleDisplay display={!requestTimeByDay}>{}</ToggleDisplay>

      <FlexCenter>
        {requestTimeByDay ? `Total days: ${0} ` : `Total hours : ${0}`}
      </FlexCenter>

      <SelectTeamMembers
        customField="employeeId"
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
