import React, { useState } from 'react';
import Select from 'react-select-plus';
import { ControlLabel, FormControl } from '@erxes/ui/src/components/form';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import {
  CustomWidthDiv,
  FlexCenter,
  FlexColumn,
  FlexRow,
  ToggleDisplay,
  FlexRowEven,
  TextAlignRight,
  CustomRangeContainer
} from '../../styles';
import { IAbsence, ITimeclock } from '../../types';
import dayjs from 'dayjs';
import { dateDayFormat, dateFormat } from '../../constants';
import Button from '@erxes/ui/src/components/Button';
import { Alert } from '@erxes/ui/src/utils';
import { timeFormat } from '../../constants';

type Props = {
  timeclocksPerUser: ITimeclock[];

  absenceRequest: IAbsence;
  timeType: string;

  contentProps: any;

  editTimeclock: (timeclockValues: any) => void;
  createTimeclock: (timeclockValues: any) => void;
  solveAbsence: (absenceRequestValues: any) => void;
};

function CheckoutForm(props: Props) {
  const {
    timeclocksPerUser,
    timeType,
    absenceRequest,
    editTimeclock,
    createTimeclock,
    solveAbsence,
    contentProps
  } = props;

  const isCheckOutRequest = timeType.includes('check out');
  const requestedTime = absenceRequest.startTime;

  const { closeModal } = contentProps;

  const [pickTimeclockType, setPickTimeclockType] = useState('');
  const [shiftStartInput, setShiftStartInput] = useState('insert');
  const [shiftStart, setShiftStart] = useState(null);
  const [shiftStartInsert, setShiftStartInsert] = useState(requestedTime);

  const [selectedTimeclock, setSelectedTimeclock] = useState(new Date());
  const [selectedTimeclockId, setSelectedTimeclockId] = useState(null);
  const [selectedTimeclockActive, setSelectedTimeclockActive] = useState(false);

  const returnAbsenceRequestTimeFormatted = () => {
    const getDate = dayjs(requestedTime).format(dateDayFormat);
    const getTime = dayjs(requestedTime).format(timeFormat);

    return getDate + ' ' + getTime;
  };
  const toggleTimeclockType = e => {
    setPickTimeclockType(e.target.value);
  };

  const toggleShiftStartInput = e => {
    setShiftStartInput(e.target.value);
  };

  const returnDateTimeFormatted = (time: any, type: string) => {
    if (type === 'timeclock') {
      const getShiftDate = dayjs(time.shiftStart).format(dateFormat);
      const getShiftStart = dayjs(time.shiftStart).format(timeFormat);
      const getShiftEnd = time.shiftEnd
        ? dayjs(time.shiftEnd).format(timeFormat)
        : 'Shift active';

      return getShiftDate + ' ' + getShiftStart + ' ~ ' + getShiftEnd;
    }

    const getDate = dayjs(time.timelog).format(dateFormat);
    const getTime = dayjs(time.timelog).format(timeFormat);

    return getDate + ' ' + getTime;
  };

  const generateTimeclockSelectOptionsForShiftStart = () => {
    const filterShiftsOfThatDay = timeclocksPerUser.filter(
      timeclock =>
        dayjs(timeclock.shiftStart).format(dateFormat) ===
        dayjs(requestedTime).format(dateFormat)
    );

    return filterShiftsOfThatDay.map(timeclock => ({
      value: timeclock._id,
      shiftEnd: timeclock.shiftEnd,
      shiftStart: timeclock.shiftStart,
      shiftActive: timeclock.shiftActive,
      label: returnDateTimeFormatted(timeclock, 'timeclock')
    }));
  };

  const generateTimeclockSelectOptionsForShiftEnd = () => {
    return timeclocksPerUser
      .filter(timeclock => timeclock.shiftStart <= requestedTime)
      .map(timeclock => ({
        value: timeclock._id,
        shiftActive: timeclock.shiftActive,
        label: returnDateTimeFormatted(timeclock, 'timeclock')
      }));
  };

  const generateRadioOptions = () => {
    const options = ['pick', 'insert'];

    return options.map(el => ({
      value: el
    }));
  };

  const onSelectTimeclock = selectedTime => {
    setSelectedTimeclock(selectedTime.shiftEnd);
    setSelectedTimeclockId(selectedTime.value);
    setSelectedTimeclockActive(selectedTime.shiftActive);
  };

  const onShiftStartInsertChange = timeVal => {
    setShiftStartInsert(timeVal);
  };

  const checkInput = () => {
    if (pickTimeclockType === 'pick' && !selectedTimeclockId) {
      Alert.error('Please pick timeclock from the list');
      return false;
    }
    //  check in request, when requested shift start is greater than shift end
    if (
      pickTimeclockType === 'pick' &&
      !isCheckOutRequest &&
      dayjs(requestedTime) >= dayjs(selectedTimeclock)
    ) {
      Alert.error(' Please choose shift end later than requested time');
      return false;
    }

    // check out requet
    if (pickTimeclockType === 'insert' && isCheckOutRequest) {
      if (
        shiftStartInput === 'insert' &&
        dayjs(shiftStartInsert) >= dayjs(requestedTime)
      ) {
        Alert.error('Please choose shift start earlier than shift end');
        return false;
      }

      if (!shiftStartInput || (shiftStartInput === 'pick' && !shiftStart)) {
        Alert.error('Please choose shift start');
        return false;
      }
    }
    return true;
  };

  const onSaveBtn = () => {
    if (checkInput()) {
      // check out request
      if (isCheckOutRequest) {
        if (pickTimeclockType === 'pick' && selectedTimeclockId) {
          // edit concurrent timeclock
          editTimeclock({
            _id: selectedTimeclockId,
            shiftEnd: requestedTime,
            shiftActive: false,
            outDeviceType: 'request'
          });
          successfulSubmit();
          return;
        }
        // insert new timeclock
        createTimeclock({
          shiftStart:
            shiftStartInput === 'pick' ? shiftStart : shiftStartInsert,
          shiftEnd: requestedTime,
          inDeviceType: 'insert',
          outDeviceType: 'request'
        });
        successfulSubmit();
      } else {
        // check in request
        if (pickTimeclockType === 'pick' && selectedTimeclockId) {
          editTimeclock({
            _id: selectedTimeclockId,
            shiftStart: requestedTime,
            shiftActive: selectedTimeclockActive,
            inDeviceType: 'request'
          });
          successfulSubmit();
          return;
        }
        // insert new active timeclock
        createTimeclock({
          shiftStart: requestedTime,
          shiftActive: true,
          inDeviceType: 'request'
        });
        successfulSubmit();
      }
    }
  };

  const successfulSubmit = () => {
    solveAbsence({
      _id: absenceRequest._id,
      status: `Approved`
    });
    closeModal();
    return;
  };

  return (
    <FlexColumn marginNum={20}>
      <div style={{ fontSize: '14px' }}>
        {returnAbsenceRequestTimeFormatted()}
      </div>
      <FlexRow>
        {isCheckOutRequest ? (
          <ControlLabel>Shift End</ControlLabel>
        ) : (
          <ControlLabel>Shift Start</ControlLabel>
        )}
        <FlexRowEven>
          <CustomWidthDiv width={120}>
            <TextAlignRight>Pick timeclock</TextAlignRight>
          </CustomWidthDiv>
          <FormControl
            rows={2}
            name="pickTimeclockType"
            componentClass="radio"
            options={generateRadioOptions()}
            inline={true}
            onChange={toggleTimeclockType}
          />
          <CustomWidthDiv width={140}>Insert new timeclock</CustomWidthDiv>
        </FlexRowEven>
      </FlexRow>

      <ToggleDisplay display={pickTimeclockType === 'pick'}>
        <Select
          placeholder="Pick a timeclock to finish"
          onChange={onSelectTimeclock}
          value={selectedTimeclockId}
          options={
            timeclocksPerUser && isCheckOutRequest
              ? generateTimeclockSelectOptionsForShiftEnd()
              : generateTimeclockSelectOptionsForShiftStart()
          }
        />
      </ToggleDisplay>

      <ToggleDisplay
        display={pickTimeclockType === 'insert' && isCheckOutRequest}
      >
        <FlexRow>
          <ControlLabel>Choose shift start</ControlLabel>

          <FlexRowEven>
            <FormControl
              rows={2}
              name="shiftStartInput"
              componentClass="radio"
              options={['insert'].map(el => ({
                value: el
              }))}
              defaultChecked={true}
              inline={true}
              onChange={toggleShiftStartInput}
            />
            <CustomWidthDiv width={140}>Insert custom date</CustomWidthDiv>
          </FlexRowEven>
        </FlexRow>

        <ToggleDisplay display={shiftStartInput === 'insert'}>
          <CustomRangeContainer>
            <DateControl
              value={shiftStartInsert}
              timeFormat={'HH:mm'}
              name="shiftStart"
              placeholder={'Starting date'}
              dateFormat={'YYYY-MM-DD'}
              onChange={onShiftStartInsertChange}
            />
          </CustomRangeContainer>
        </ToggleDisplay>
      </ToggleDisplay>

      <FlexCenter>
        <Button btnStyle="primary" onClick={onSaveBtn}>
          Submit
        </Button>
      </FlexCenter>
    </FlexColumn>
  );
}

export default CheckoutForm;
