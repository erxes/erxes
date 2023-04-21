import React from 'react';
import Datetime from '@nateradebaugh/react-datetime';
import Button from '@erxes/ui/src/components/Button';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';
import Select from 'react-select-plus';
import { CustomRangeContainer, FlexRow, FlexRowEven } from '../../styles';
import { timeFormat } from '../../constants';
import { IScheduleDate } from '../../types';

type Props = {
  // startDate?: Date;
  // startTime_value?: Date;
  // endTime_value?: Date;
  // lunchBreakInMins?: number;
  // overnightShift?: boolean;

  scheduledDate: IScheduleDate;
  curr_day_key: string;

  scheduleConfigOptions?: any;
  selectedScheduleConfigId?: string;

  changeDate?: (day_key: string, time: Date) => void;
  changeScheduleConfig: (day_key: string, scheduleConfigId: string) => void;
  removeDate?: (day_key: string) => void;
  timeOnly?: boolean;
  dateOnly?: boolean;
};

const DatePicker = (props: Props) => {
  const {
    changeDate,
    removeDate,
    changeScheduleConfig,
    scheduleConfigOptions,
    selectedScheduleConfigId,
    curr_day_key,

    scheduledDate
  } = props;

  const {
    shiftDate,
    shiftStart,
    shiftEnd,
    lunchBreakInMins,
    overnightShift
  } = scheduledDate;

  const onDateChange = val => {
    if (changeDate) {
      changeDate(curr_day_key, val);
    }
  };

  // const onStartTimeChange = val => {
  //   changeStartTime(curr_day_key, val);
  // };

  // const onEndTimeChange = val => {
  //   changeEndTime(curr_day_key, val);
  // };

  const onDeleteDate = () => {
    if (removeDate) {
      removeDate(curr_day_key);
    }
  };

  // const onTimeChange = (input: any, type: string) => {
  //   const getDate = startDate
  //     ? startDate.toLocaleDateString()
  //     : new Date().toLocaleDateString();
  //   const validateInput = dayjs(getDate + ' ' + input).toDate();

  //   if (
  //     input instanceof Date &&
  //     startDate?.getUTCFullYear() === input.getUTCFullYear()
  //   ) {
  //     if (type === 'start') {
  //       onStartTimeChange(input);
  //     } else {
  //       onEndTimeChange(input);
  //     }
  //   }

  //   if (!isNaN(validateInput.getTime())) {
  //     if (type === 'start') {
  //       onStartTimeChange(validateInput);
  //     } else {
  //       onEndTimeChange(validateInput);
  //     }
  //   }
  // };

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
      <div style={{ width: '50%' }}>
        <Select
          onChange={onScheduleConfigSelect}
          placeholder="Select Schedule"
          options={scheduleConfigOptions}
          value={selectedScheduleConfigId}
          multi={false}
        />
      </div>
      <FlexRow style={{ width: '28%' }}>
        <FlexRowEven style={{ gap: '20px' }}>
          <CustomRangeContainer>
            {dayjs(shiftStart).format(timeFormat)}
          </CustomRangeContainer>
          <CustomRangeContainer>
            {dayjs(shiftEnd).format(timeFormat)}
          </CustomRangeContainer>
          <CustomRangeContainer>( {lunchBreakInMins}' )</CustomRangeContainer>
        </FlexRowEven>
        <Tip text="Delete" placement="auto-start">
          <Button btnStyle="link" onClick={onDeleteDate} icon="times-circle" />
        </Tip>
      </FlexRow>
    </FlexRow>
  );
};

export default DatePicker;
