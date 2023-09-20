import React, { useState } from 'react';
import Datetime from '@nateradebaugh/react-datetime';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';
import Select from 'react-select-plus';
import { CustomWidth, FlexRow } from '../../styles';
import { timeFormat } from '../../constants';
import { IScheduleDate } from '../../types';
import { FormControl } from '@erxes/ui/src/components/form';

type Props = {
  scheduledDate: IScheduleDate;
  curr_day_key: string;

  scheduleConfigOptions?: any;
  selectedScheduleConfigId?: string;

  changeDate?: (day_key: string, time: Date) => void;
  changeScheduleConfig: (day_key: string, scheduleConfigId: string) => void;
  changeScheduleTime: (day_key: string, type: string, timeVal: Date) => void;
  changeScheduleBreak: (day_key: string, breakMins: number) => void;

  removeDate?: (day_key: string) => void;
  timeOnly?: boolean;
  dateOnly?: boolean;
  onInputCheckedChange: (day_key: string, checked: boolean) => void;
  inputDefaultChecked: boolean;
};

const DatePicker = (props: Props) => {
  const {
    changeDate,
    removeDate,
    changeScheduleConfig,
    scheduleConfigOptions,
    selectedScheduleConfigId,
    curr_day_key,

    scheduledDate,
    onInputCheckedChange,
    changeScheduleTime,
    changeScheduleBreak
  } = props;

  const [shiftStartInput, setShiftStartInput] = useState(
    scheduledDate.shiftStart || new Date(scheduledDate.shiftDate + ' 09:00')
  );

  const [shiftEndInput, setShiftEndInput] = useState(
    scheduledDate.shiftEnd || new Date(scheduledDate.shiftDate + ' 09:00')
  );

  const onTimeChange = (input: any, type: string) => {
    const startDate = scheduledDate.shiftDate;

    const getDate = startDate
      ? startDate.toLocaleDateString()
      : new Date().toLocaleDateString();
    const validateInput = dayjs(getDate + ' ' + input).toDate();

    if (
      input instanceof Date &&
      startDate?.getUTCFullYear() === input.getUTCFullYear()
    ) {
      if (type === 'start') {
        setShiftStartInput(input);
        changeScheduleTime(curr_day_key, type, input);
      } else {
        setShiftEndInput(input);
        changeScheduleTime(curr_day_key, type, input);
      }
    }

    if (!isNaN(validateInput.getTime())) {
      if (type === 'start') {
        setShiftStartInput(validateInput);
        changeScheduleTime(curr_day_key, type, validateInput);
      } else {
        setShiftEndInput(validateInput);
        changeScheduleTime(curr_day_key, type, validateInput);
      }
    }
  };

  const onBreakChange = e => {
    const getBreakInMins = parseInt(e.currentTarget.value, 10);
    changeScheduleBreak(curr_day_key, getBreakInMins);
  };

  const toggleInputChecked = e => {
    onInputCheckedChange(curr_day_key, e.target.checked);
  };

  const {
    shiftDate,
    shiftStart,
    shiftEnd,
    lunchBreakInMins,
    inputChecked
  } = scheduledDate;

  const onDateChange = val => {
    if (changeDate) {
      changeDate(curr_day_key, val);
    }
  };

  const onDeleteDate = () => {
    if (removeDate) {
      removeDate(curr_day_key);
    }
  };

  const onScheduleConfigSelect = el => {
    changeScheduleConfig(curr_day_key, el.value);
  };

  return (
    <FlexRow>
      <div style={{ width: '15%' }}>
        <Datetime
          inputProps={{ style: { textAlign: 'center' } }}
          value={shiftDate}
          timeFormat={false}
          onChange={onDateChange}
        />
      </div>
      {!inputChecked && (
        <Select
          onChange={onScheduleConfigSelect}
          placeholder="Select Schedule"
          options={scheduleConfigOptions}
          value={selectedScheduleConfigId}
          multi={false}
          // components={{ _Option: CustomOption }}
        />
      )}
      <FlexRow style={{ width: '40%' }}>
        <CustomWidth widthPercent={15}>
          {inputChecked ? (
            <Datetime
              value={shiftStart}
              dateFormat={false}
              timeFormat={'HH:mm'}
              onChange={val => onTimeChange(val, 'start')}
            />
          ) : (
            <>{dayjs(shiftStart).format(timeFormat)}</>
          )}
        </CustomWidth>
        <CustomWidth widthPercent={15}>
          {inputChecked ? (
            <Datetime
              value={shiftEnd}
              dateFormat={false}
              timeFormat={'HH:mm'}
              onChange={val => onTimeChange(val, 'end')}
              inputProps={{
                onKeyPress: e => {
                  if (e.key === 'Enter') {
                    changeScheduleTime(curr_day_key, 'start', shiftStartInput);
                  }
                }
              }}
            />
          ) : (
            <>{dayjs(shiftEnd).format(timeFormat)}</>
          )}
        </CustomWidth>
        <CustomWidth widthPercent={15}>
          {inputChecked ? (
            <FormControl
              name="lunchBreakInMins"
              componentClass="number"
              defaultValue={lunchBreakInMins}
              onChange={onBreakChange}
            />
          ) : (
            lunchBreakInMins
          )}
        </CustomWidth>
        <FormControl
          name="inputChecked"
          componentClass="checkbox"
          defaultChecked={inputChecked}
          onChange={toggleInputChecked}
        />
        <Tip text="Delete" placement="auto-start">
          <Button btnStyle="link" onClick={onDeleteDate} icon="times-circle" />
        </Tip>
      </FlexRow>
    </FlexRow>
  );
};

export default DatePicker;
