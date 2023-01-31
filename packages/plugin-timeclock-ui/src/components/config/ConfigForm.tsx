import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  CustomRangeContainer,
  FlexRow,
  FlexColumn,
  FlexColumnMargined,
  FlexCenter
} from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import {
  IAbsence,
  IAbsenceType,
  IPayDates,
  ISchedule,
  IScheduleConfig
} from '../../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import DatePicker from '../datepicker/DateTimePicker';
import { compareStartAndEndTime } from '../../utils';
import dayjs from 'dayjs';

type Props = {
  history?: any;
  configType: string;
  absenceType?: IAbsenceType;
  scheduleConfig?: IScheduleConfig;
  holiday?: IAbsence;
  payDate?: IPayDates;
  loading?: boolean;
  afterSave?: () => void;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => void;
};

function ConfigForm(props: Props) {
  const { renderButton, history, scheduleConfig } = props;
  const { absenceType, holiday, payDate } = props;
  const [isShiftRequest, setShiftRequest] = useState(
    (absenceType && absenceType.shiftRequest) || false
  );
  const [explanationRequired, setExplRequired] = useState(
    (absenceType && absenceType.explRequired) || false
  );
  const [attachmentRequired, setAttachRequired] = useState(
    (absenceType && absenceType.attachRequired) || false
  );
  const [payPeriod, setPayPeriod] = useState('');

  const defaultStartTime = new Date(
    new Date().toLocaleDateString() + ' 08:30:00'
  );

  const defaultEndTime = new Date(
    new Date().toLocaleDateString() + ' 17:00:00'
  );

  const shiftStartTime = new Date(
    new Date().toLocaleDateString() +
      ' ' +
      (scheduleConfig ? scheduleConfig.shiftStart : '08:30:00')
  );
  const shiftEndTime = new Date(
    new Date().toLocaleDateString() +
      ' ' +
      (scheduleConfig ? scheduleConfig.shiftEnd : '17:00:00')
  );

  const configDaysTime: ISchedule = {
    configTime: {
      shiftStart: shiftStartTime,
      shiftEnd: shiftEndTime
    },
    validCheckIn: {
      shiftStart: defaultStartTime,
      shiftEnd: defaultEndTime
    },
    validCheckout: {
      shiftStart: defaultStartTime,
      shiftEnd: defaultEndTime
    },
    overtime: {
      shiftStart: defaultStartTime,
      shiftEnd: defaultEndTime
    }
  };

  scheduleConfig?.configDays.forEach(configDay => {
    configDaysTime[configDay.configName].shiftStart = new Date(
      new Date().toLocaleDateString() + ' ' + configDay.configShiftStart
    );
    configDaysTime[configDay.configName].shiftEnd = new Date(
      new Date().toLocaleDateString() + ' ' + configDay.configShiftEnd
    );
  });

  const [configDays, setConfigDays] = useState<ISchedule>({
    ...configDaysTime
  });

  const [holidayDates, setHolidayDates] = useState({
    startingDate: (holiday && holiday.startTime) || null,
    endingDate: (holiday && holiday.endTime) || null
  });
  const [payDates, setpayDates] = useState({
    date1: new Date(),
    date2: new Date()
  });

  const { afterSave, closeModal } = props;

  const togglePayPeriod = e => {
    setPayPeriod(e.target.value);
  };
  const toggleShiftRequest = e => {
    setShiftRequest(e.target.checked);
  };
  const toggleExplRequired = e => {
    setExplRequired(e.target.checked);
  };
  const toggleAttachRequired = e => {
    setAttachRequired(e.target.checked);
  };

  const onConfigDateChange = (dateNum: string, newDate: Date) => {
    payDates[dateNum] = newDate;
    setpayDates({ ...payDates });
  };

  const onHolidayStartDateChange = newStartDate => {
    setHolidayDates({ ...holidayDates, startingDate: newStartDate });
  };
  const onHolidayEndDateChange = newEndDate => {
    setHolidayDates({ ...holidayDates, endingDate: newEndDate });
  };

  const generateDoc = (
    values: {
      _id?: string;
      holidayName?: string;
      startDate?: Date;
      endDate?: Date;
      absenceName?: string;
      scheduleName?: string;
      explRequired?: boolean;
      attachRequired?: boolean;
      shiftRequest?: boolean;
    },
    name: string
  ) => {
    switch (name) {
      case 'absenceType':
        if (absenceType) {
          values._id = absenceType._id;
        }

        return {
          name: values.absenceName,
          explRequired: explanationRequired,
          attachRequired: attachmentRequired,
          shiftRequest: isShiftRequest,
          _id: values._id
        };

      case 'holiday':
        if (holiday) {
          values._id = holiday._id;
        }

        return {
          _id: values._id,
          name: values.holidayName,
          startDate: holidayDates.startingDate,
          endDate: holidayDates.endingDate
        };

      case 'payDate':
        if (payDate) {
          values._id = payDate._id;
        }

        return {
          _id: values._id,
          dateNums:
            payPeriod === 'twice'
              ? Object.values(payDates).map(date => date.getDate())
              : [payDates.date1.getDate()]
        };

      case 'schedule':
        const returnVariables: {
          _id?: string;
          scheduleName?: string;
          configShiftStart?: string;
          configShiftEnd?: string;
          scheduleConfig: any[];
        } = {
          scheduleName: values.scheduleName,
          scheduleConfig: []
        };
        if (scheduleConfig) {
          returnVariables._id = scheduleConfig._id;
        }
        const timeFormat = 'HH:mm';

        Object.keys(configDays).forEach(day_key => {
          if (day_key.toLocaleLowerCase() !== 'configtime') {
            returnVariables.scheduleConfig.push({
              configName: day_key,
              shiftStart: configDays[day_key].shiftStart,
              shiftEnd: configDays[day_key].shiftEnd,
              overnightShift: configDays[day_key].overnightShift
            });
          } else {
            returnVariables.configShiftStart = dayjs(
              configDays[day_key].shiftStart
            ).format(timeFormat);
            returnVariables.configShiftEnd = dayjs(
              configDays[day_key].shiftEnd
            ).format(timeFormat);
          }
        });
        return returnVariables;
    }
  };

  const renderConfigContent = () => {
    const { configType } = props;
    switch (configType) {
      case 'PayDate':
        return <Form renderContent={renderPayDateContent} />;
      case 'Holiday':
        return <Form renderContent={renderHolidayContent} />;
      case 'Schedule':
        return <Form renderContent={renderScheduleContent} />;
      // Absence
      default:
        return <Form renderContent={renderAbsenceContent} />;
    }
  };

  const renderAbsenceContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <FlexColumn marginNum={20}>
        <ControlLabel required={true}>Name</ControlLabel>
        <FormControl
          {...formProps}
          name="absenceName"
          defaultValue={absenceType && absenceType.name}
          required={true}
          autoFocus={true}
        />
        <FlexRow>
          <ControlLabel>Shift Request</ControlLabel>
          <FormControl
            name="shiftRequest"
            componentClass="checkbox"
            defaultChecked={absenceType?.shiftRequest}
            onChange={toggleShiftRequest}
          />
        </FlexRow>
        <FlexRow>
          <ControlLabel>Explanation Required</ControlLabel>
          <FormControl
            name="explRequired"
            componentClass="checkbox"
            defaultChecked={absenceType?.explRequired}
            onChange={toggleExplRequired}
          />
        </FlexRow>
        <FlexRow>
          <ControlLabel>Attachment Required</ControlLabel>
          <FormControl
            name="attachRequired"
            componentClass="checkbox"
            defaultChecked={absenceType?.attachRequired}
            onChange={toggleAttachRequired}
          />
        </FlexRow>
        <FlexCenter style={{ marginTop: '10px' }}>
          {renderButton({
            name: 'absenceType',
            values: generateDoc(values, 'absenceType'),
            isSubmitted,
            callback: closeModal || afterSave,
            object: absenceType || null
          })}
        </FlexCenter>
      </FlexColumn>
    );
  };

  const renderPayDateContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;
    return (
      <FlexColumn marginNum={10}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ControlLabel>Pay period</ControlLabel>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: '10px'
            }}
          >
            <div>Once</div>
            <FormControl
              rows={2}
              name="payPeriod"
              componentClass="radio"
              options={['once', 'twice'].map(el => ({
                value: el
              }))}
              inline={true}
              onChange={togglePayPeriod}
            />
            <div>Twice</div>
          </div>
        </div>
        <CustomRangeContainer>
          {payPeriod === '' ? (
            <></>
          ) : (
            <>
              <DateControl
                value={payDates.date1}
                required={false}
                onChange={(val: any) => onConfigDateChange('date1', val)}
                placeholder={'Enter date'}
                dateFormat={'YYYY-MM-DD'}
              />
              {payPeriod === 'twice' ? (
                <DateControl
                  value={payDates.date2}
                  required={false}
                  onChange={(val: any) => onConfigDateChange('date2', val)}
                  placeholder={'Enter date'}
                  dateFormat={'YYYY-MM-DD'}
                />
              ) : (
                <></>
              )}
            </>
          )}
        </CustomRangeContainer>
        <FlexCenter style={{ marginTop: '10px' }}>
          {renderButton({
            name: 'payDate',
            isSubmitted,
            values: generateDoc(values, 'payDate'),
            callback: closeModal || afterSave,
            object: payDate || null
          })}
        </FlexCenter>
      </FlexColumn>
    );
  };

  const onStartTimeChange = (day_key, time_val) => {
    const newShift = configDays[day_key];
    const [
      getCorrectStartTime,
      getCorrectEndTime,
      overnight
    ] = compareStartAndEndTime(configDays, day_key, time_val, null);

    newShift.shiftStart = getCorrectStartTime;
    newShift.overnightShift = overnight;
    newShift.shiftEnd = getCorrectEndTime;

    const newconfigDays = { ...configDays, [day_key]: newShift };
    setConfigDays(newconfigDays);
  };

  const onEndTimeChange = (day_key, time_val) => {
    const newShift = configDays[day_key];
    const [
      getCorrectStartTime,
      getCorrectEndTime,
      overnight
    ] = compareStartAndEndTime(configDays, day_key, null, time_val);

    newShift.shiftStart = getCorrectStartTime;
    newShift.overnightShift = overnight;
    newShift.shiftEnd = getCorrectEndTime;

    const newconfigDays = { ...configDays, [day_key]: newShift };
    setConfigDays(newconfigDays);
  };

  const renderConfigTime = () => {
    return (
      <>
        <FlexRow>
          <ControlLabel>Check in / Check out</ControlLabel>
          <DatePicker
            curr_day_key={'configTime'}
            startDate={configDays.configTime.shiftStart}
            startTime_value={configDays.configTime.shiftStart}
            endTime_value={configDays.configTime.shiftEnd}
            overnightShift={configDays.configTime.overnightShift}
            changeEndTime={onEndTimeChange}
            changeStartTime={onStartTimeChange}
            timeOnly={true}
          />
        </FlexRow>
        <FlexRow>
          <ControlLabel>Valid Check-In</ControlLabel>
          <DatePicker
            curr_day_key={'validCheckIn'}
            startDate={configDays.validCheckIn.shiftStart}
            startTime_value={configDays.validCheckIn.shiftStart}
            endTime_value={configDays.validCheckIn.shiftEnd}
            overnightShift={configDays.validCheckIn.overnightShift}
            changeEndTime={onEndTimeChange}
            changeStartTime={onStartTimeChange}
            timeOnly={true}
          />
        </FlexRow>
        <FlexRow>
          <ControlLabel>Valid Check-Out</ControlLabel>
          <DatePicker
            curr_day_key={'validCheckout'}
            startDate={configDays.validCheckout.shiftStart}
            startTime_value={configDays.validCheckout.shiftStart}
            endTime_value={configDays.validCheckout.shiftEnd}
            overnightShift={configDays.validCheckout.overnightShift}
            changeEndTime={onEndTimeChange}
            changeStartTime={onStartTimeChange}
            timeOnly={true}
          />
        </FlexRow>
        <FlexRow>
          <ControlLabel>Overtime</ControlLabel>
          <DatePicker
            curr_day_key={'overtime'}
            startDate={configDays.overtime.shiftStart}
            startTime_value={configDays.overtime.shiftStart}
            endTime_value={configDays.overtime.shiftEnd}
            changeEndTime={onEndTimeChange}
            changeStartTime={onStartTimeChange}
            timeOnly={true}
          />
        </FlexRow>
      </>
    );
  };

  const renderScheduleContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    return (
      <FlexColumn marginNum={20}>
        <ControlLabel required={true}>
          <strong>Name</strong>
        </ControlLabel>
        <FormControl
          {...formProps}
          defaultValue={scheduleConfig?.scheduleName}
          name="scheduleName"
          required={true}
          autoFocus={true}
        />

        <FlexColumnMargined marginNum={10}>
          {renderConfigTime()}
        </FlexColumnMargined>

        <FlexCenter style={{ marginTop: '10px' }}>
          {renderButton({
            name: 'schedule',
            values: generateDoc(values, 'schedule'),
            isSubmitted,
            callback: closeModal || afterSave,
            object: scheduleConfig || null
          })}
        </FlexCenter>
      </FlexColumn>
    );
  };

  const renderHolidayContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    return (
      <FlexColumn marginNum={20}>
        <ControlLabel required={true}>Holiday Name</ControlLabel>
        <FormControl
          {...formProps}
          name="holidayName"
          defaultValue={holiday && holiday.holidayName}
          required={true}
          autoFocus={true}
        />
        <CustomRangeContainer>
          <DateControl
            value={holidayDates.startingDate}
            required={false}
            onChange={onHolidayStartDateChange}
            placeholder={'Starting date'}
            dateFormat={'YYYY-MM-DD'}
          />
          <DateControl
            value={holidayDates.endingDate}
            required={false}
            onChange={onHolidayEndDateChange}
            placeholder={'Ending date'}
            dateFormat={'YYYY-MM-DD'}
          />
        </CustomRangeContainer>
        <FlexCenter style={{ marginTop: '10px' }}>
          {renderButton({
            name: 'holiday',
            values: generateDoc(values, 'holiday'),
            isSubmitted,
            callback: closeModal || afterSave,
            object: holiday || null
          })}
        </FlexCenter>
      </FlexColumn>
    );
  };
  return renderConfigContent();
}

export default ConfigForm;
