import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';

type Props = {
  startTime_value: Date;
  endTime_value: Date;
  curr_day_key: string;
  changeDate: (day_key: string, time: Date) => void;
  changeStartTime: (day_key: string, time: Date) => void;
  changeEndTime: (day_key: string, time: Date) => void;
  removeDate: (day_key: string) => void;
};

const Datetime = asyncComponent(() =>
  import(/* webpackChunkName: "Datetime" */ '@nateradebaugh/react-datetime')
);

const DatePicker = (props: Props) => {
  const {
    changeDate,
    changeEndTime,
    changeStartTime,
    removeDate,
    curr_day_key,
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

  const onDeleteDate = () => {
    removeDate(curr_day_key);
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
      <Tip text="Delete" placement="top">
        <Button btnStyle="link" onClick={onDeleteDate} icon="times-circle" />
      </Tip>
    </div>
  );
};

export default DatePicker;
