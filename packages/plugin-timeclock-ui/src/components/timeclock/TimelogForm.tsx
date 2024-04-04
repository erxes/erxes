import React, { useState } from 'react';
import Select from 'react-select-plus';
import { ControlLabel, FormControl } from '@erxes/ui/src/components/form';
import {
  CustomRangeContainer,
  FlexCenter,
  FlexColumn,
  FlexRow,
  FlexRowEven,
  ToggleDisplay
} from '../../styles';
import { ITimeclock, ITimelog } from '../../types';
import { dateAndTimeFormat } from '../../constants';
import dayjs from 'dayjs';
import { IFormProps } from '@erxes/ui/src/types';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import { Alert } from '@erxes/ui/src/utils';
import Form from '@erxes/ui/src/components/form/Form';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  timeclock: ITimeclock;
  timelogsPerUser: ITimelog[];

  contentProps: any;

  timeclockEdit: (values: any) => void;
};
export const TimelogForm = (props: Props) => {
  const { timeclock, timelogsPerUser, contentProps, timeclockEdit } = props;

  const { closeModal } = contentProps;

  const [shiftStart, setShiftStart] = useState(timeclock.shiftStart);
  const [shiftStartInsert, setShiftStartInsert] = useState(
    timeclock.shiftStart
  );

  const [inDevice, setInDevice] = useState(null);
  const [outDevice, setOutDevice] = useState(null);

  const [shiftEnd, setShiftEnd] = useState(timeclock.shiftEnd);
  const [shiftEndInsert, setShiftEndInsert] = useState(
    timeclock.shiftEnd || timeclock.shiftStart
  );

  const [shiftEnded, setShiftEnded] = useState(!timeclock.shiftActive);
  const [shiftStartInput, setShiftStartInput] = useState('');
  const [shiftEndInput, setShiftEndInput] = useState('');

  const onShiftStartChange = selectedTime => {
    setInDevice(selectedTime.deviceName);
    setShiftStart(selectedTime.value);
  };

  const onShiftStartInsertChange = date => {
    setShiftStartInsert(date);
  };

  const onShiftEndInsertChange = date => {
    setShiftEndInsert(date);
  };

  const onShiftEndChange = selectedTime => {
    setOutDevice(selectedTime.deviceName);
    setShiftEnd(selectedTime.value);
  };

  const generateSelectOptions = () => {
    return timelogsPerUser.map(timelog => ({
      value: timelog.timelog,
      label: dayjs(timelog.timelog).format(dateAndTimeFormat),
      deviceName: timelog.deviceName
    }));
  };

  const toggleShiftStartInput = e => {
    setShiftStartInput(e.target.value);
  };

  const toggleShiftEndInput = e => {
    setShiftEndInput(e.target.value);
  };

  const toggleShiftActive = e => {
    setShiftEnded(e.target.checked);
  };

  const editTimeClock = () => {
    const values = generateDoc();

    if (checkInput()) {
      timeclockEdit(values);
      closeModal();
    }
  };
  const generateDoc = () => {
    checkInput();
    const getShiftStart =
      (shiftStartInput === 'pick' ? shiftStart : shiftStartInsert) ||
      timeclock.shiftStart;

    let outDeviceType;
    let inDeviceType;

    let inDeviceName;
    let outDeviceName;

    if (
      shiftStart !== timeclock.shiftStart ||
      shiftStartInsert !== timeclock.shiftStart
    ) {
      inDeviceType = shiftStartInput === 'pick' ? 'log' : 'insert';
      inDeviceName = inDevice;
    }

    if (!shiftEnded) {
      return {
        _id: timeclock._id,
        shiftStart: getShiftStart,
        shiftActive: true,
        inDevice: inDeviceName,
        inDeviceType
      };
    }

    if (
      shiftEnd !== timeclock.shiftEnd ||
      shiftEndInsert !== timeclock.shiftEnd
    ) {
      outDeviceType = shiftEndInput === 'pick' ? 'log' : 'insert';
      outDeviceName = outDevice;
    }

    return {
      _id: timeclock._id,
      shiftStart: getShiftStart,
      shiftEnd: shiftEndInput === 'pick' ? shiftEnd : shiftEndInsert,
      shiftActive: !shiftEnded,
      inDeviceType,
      inDevice: inDeviceName,
      outDeviceType,
      outDevice: outDeviceName
    };
  };

  const checkInput = () => {
    const getShiftStart = dayjs(
      (shiftStartInput === 'pick' ? shiftStart : shiftStartInsert) ||
        timeclock.shiftStart
    );

    const getShiftEnd = dayjs(
      shiftEndInput === 'pick' ? shiftEnd : shiftEndInsert
    );

    if (shiftStartInput === 'insert' && !getShiftStart) {
      Alert.error('Please insert shift start');
      return false;
    }
    if (shiftEndInput === 'insert' && !getShiftEnd) {
      Alert.error('Please insert shift end');
      return false;
    }

    if (getShiftStart && getShiftEnd && getShiftEnd < getShiftStart) {
      Alert.error('Shift end can not be sooner than shift start');
      return false;
    }

    return true;
  };

  const renderTimelogForm = (formProps: IFormProps) => {
    return (
      <FlexColumn marginNum={20}>
        <div>
          {timeclock.user &&
            timeclock.user.details &&
            timeclock.user.details.fullName}
        </div>
        <FlexRow>
          <ControlLabel>Shift Start</ControlLabel>
          <FlexRowEven>
            <div>Pick from time logs</div>
            <FormControl
              rows={2}
              name="shiftStartInput"
              componentClass="radio"
              options={['pick', 'insert'].map(el => ({
                value: el
              }))}
              inline={true}
              onChange={toggleShiftStartInput}
            />
            <div>Insert custom date</div>
          </FlexRowEven>
        </FlexRow>

        <ToggleDisplay display={shiftStartInput === 'pick'}>
          <Select
            placeholder="Shift start"
            onChange={onShiftStartChange}
            value={shiftStart}
            options={timelogsPerUser && generateSelectOptions()}
          />
        </ToggleDisplay>
        <ToggleDisplay display={shiftStartInput === 'insert'}>
          <CustomRangeContainer>
            <DateControl
              value={shiftStartInsert}
              name="startDate"
              placeholder={'Starting date'}
              dateFormat={'YYYY-MM-DD'}
              timeFormat={'HH:mm'}
              onChange={onShiftStartInsertChange}
            />
          </CustomRangeContainer>
        </ToggleDisplay>

        <FlexRow>
          <ControlLabel>Shift Ended</ControlLabel>
          <FlexRowEven>
            <FormControl
              name="shiftActive"
              defaultChecked={shiftEnded}
              componentClass="checkbox"
              onChange={toggleShiftActive}
            />
            <div>Ended</div>
          </FlexRowEven>
        </FlexRow>

        <ToggleDisplay display={shiftEnded}>
          <FlexRow>
            <ControlLabel>Shift End</ControlLabel>
            <FlexRowEven>
              <div>Pick from time logs</div>
              <FormControl
                rows={2}
                name="shiftEndInput"
                componentClass="radio"
                options={['pick', 'insert'].map(el => ({
                  value: el
                }))}
                inline={true}
                onChange={toggleShiftEndInput}
              />
              <div>Insert custom date</div>
            </FlexRowEven>
          </FlexRow>

          <ToggleDisplay display={shiftEndInput === 'pick'}>
            <Select
              placeholder="Shift end"
              onChange={onShiftEndChange}
              value={shiftEnd}
              options={timelogsPerUser && generateSelectOptions()}
            />
          </ToggleDisplay>
          <ToggleDisplay display={shiftEndInput === 'insert'}>
            <CustomRangeContainer>
              <DateControl
                value={shiftEndInsert}
                name="startDate"
                placeholder={'Starting date'}
                dateFormat={'YYYY-MM-DD'}
                timeFormat={'HH:mm'}
                onChange={onShiftEndInsertChange}
              />
            </CustomRangeContainer>
          </ToggleDisplay>
        </ToggleDisplay>

        <FlexCenter style={{ marginTop: '10px' }}>
          <Button btnStyle="primary" onClick={editTimeClock}>
            Save
          </Button>
        </FlexCenter>
      </FlexColumn>
    );
  };

  return <Form renderContent={renderTimelogForm} />;
};
