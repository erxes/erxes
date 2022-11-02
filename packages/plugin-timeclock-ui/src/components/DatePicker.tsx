import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

type Props = {
  curr_day_key: number;
  changeDate: (day_key: number, time: Date) => void;
  changeStartTime: (day_key: number, time: Date) => void;
  changeEndTime: (day_key: number, time: Date) => void;
};

const Datetime = asyncComponent(
  () =>
    import(/* webpackChunkName: "Datetime" */ '@nateradebaugh/react-datetime')
  // import('react-time-picker')
);

const DatePicker = (props: Props) => {
  const { changeDate, changeEndTime, changeStartTime, curr_day_key } = props;

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
        value={new Date()}
        timeIntervals={15}
        timeFormat={false}
        onChange={onDateChange}
      />
      <Datetime
        value={new Date()}
        dateFormat={false}
        timeIntervals={15}
        timeFormat="hh:mm a"
        onChange={onStartTimeChange}
      />
      <Datetime
        value={new Date()}
        dateFormat={false}
        timeIntervals={15}
        timeFormat="hh:mm a"
        onChange={onEndTimeChange}
      />
    </div>
  );
};

export default DatePicker;
