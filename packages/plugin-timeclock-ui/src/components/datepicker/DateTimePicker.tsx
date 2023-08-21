import React from 'react';
import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';

type Props = {
  startDate?: Date;
  startTime_value?: Date;
  endTime_value?: Date;
  curr_day_key: string;
  overnightShift?: boolean;
  changeDate?: (day_key: string, time: Date) => void;
  changeStartTime: (day_key: string, time: Date) => void;
  changeEndTime: (day_key: string, time: Date) => void;
  removeDate?: (day_key: string) => void;
  timeOnly?: boolean;
};

const DateTimePicker = (props: Props) => {
  const {
    changeDate,
    changeEndTime,
    changeStartTime,
    removeDate,
    timeOnly,
    curr_day_key,
    startDate,
    overnightShift,
    startTime_value,
    endTime_value
  } = props;

  const onDateChange = val => {
    if (changeDate) {
      changeDate(curr_day_key, val);
    }
  };

  const onStartTimeChange = val => {
    changeStartTime(curr_day_key, val);
  };

  const onEndTimeChange = val => {
    changeEndTime(curr_day_key, val);
  };

  const onDeleteDate = () => {
    if (removeDate) {
      removeDate(curr_day_key);
    }
  };

  const onTimeChange = (input: any, type: string) => {
    const getDate = startDate
      ? startDate.toLocaleDateString()
      : new Date().toLocaleDateString();
    const validateInput = dayjs(getDate + ' ' + input).toDate();

    if (
      input instanceof Date &&
      startDate?.getUTCFullYear() === input.getUTCFullYear()
    ) {
      if (type === 'start') {
        onStartTimeChange(input);
      } else {
        onEndTimeChange(input);
      }
    }

    if (!isNaN(validateInput.getTime())) {
      if (type === 'start') {
        onStartTimeChange(validateInput);
      } else {
        onEndTimeChange(validateInput);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flex: 'row',
        gap: '10px',
        alignItems: 'center'
      }}
      key={curr_day_key}
    >
      {!timeOnly && (
        <Datetime
          value={startDate}
          timeFormat={false}
          onChange={onDateChange}
        />
      )}
      <Datetime
        value={startTime_value}
        dateFormat={false}
        timeFormat="HH:mm"
        timeConstraints={{
          hours: { min: 0, max: 24, step: 1 }
        }}
        onChange={val => onTimeChange(val, 'start')}
      />
      <Datetime
        value={endTime_value}
        dateFormat={false}
        timeFormat="HH:mm"
        onChange={val => onTimeChange(val, 'end')}
      />
      {overnightShift ? 'Overnight' : ''}
    </div>
  );
};

export default DateTimePicker;
