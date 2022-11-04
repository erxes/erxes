import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

type Props = {
  // day_value: Date;
  startTime_value: Date;
  endTime_value: Date;
  curr_day_key: string;
  changeDate: (day_key: string, time: Date) => void;
  changeStartTime: (day_key: string, time: Date) => void;
  changeEndTime: (day_key: string, time: Date) => void;
};

const Datetime = asyncComponent(
  () =>
    import(/* webpackChunkName: "Datetime" */ '@nateradebaugh/react-datetime')
  // import('react-time-picker')
);

const DatePicker = (props: Props) => {
  const {
    changeDate,
    changeEndTime,
    changeStartTime,
    curr_day_key,
    // day_value,
    startTime_value,
    endTime_value
  } = props;

  const onDateChange = val => {
    changeDate(curr_day_key, val);
  };

  const onStartTimeChange = val => {
    changeStartTime(curr_day_key, val);
  };

  const onEndTimeChange = val => {
    changeEndTime(curr_day_key, val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }} key={curr_day_key}>
      <Datetime
        value={startTime_value}
        timeIntervals={15}
        timeFormat={false}
        onChange={onDateChange}
      />
      <Datetime
        value={startTime_value}
        dateFormat={false}
        timeIntervals={15}
        timeFormat="hh:mm a"
        onChange={onStartTimeChange}
      />
      <Datetime
        value={endTime_value}
        dateFormat={false}
        timeIntervals={15}
        timeFormat="hh:mm a"
        onChange={onEndTimeChange}
      />
    </div>
  );
};

export default DatePicker;
