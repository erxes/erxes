import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  CustomRangeContainer,
  FlexRow,
  FlexColumn,
  FlexCenter
} from '../../styles';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IAbsence, IAbsenceType, IPayDates, ISchedule } from '../../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import ScheduleConfig from './ScheduleDayToggleConfig';
import Datetime from '@nateradebaugh/react-datetime';
import Select from 'react-select-plus';
import { Input } from '../../styles';

type Props = {
  history?: any;
  configType: string;
  absenceType?: IAbsenceType;
  holiday?: IAbsence;
  payDate?: IPayDates;
  absenceTypes?: IAbsenceType[];
  loading?: boolean;
  afterSave?: () => void;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => void;
};

function ConfigForm(props: Props) {
  const { renderButton, history } = props;
  const { absenceType, holiday, payDate } = props;
  const [explanationRequired, setExplRequired] = useState(false);
  const [attachmentRequired, setAttachRequired] = useState(false);
  const [payPeriod, setPayPeriod] = useState('');

  const [contentType, setContentType] = useState('');
  const [configDays, setConfigDays] = useState<ISchedule>({
    Monday: { display: true, shiftStart: undefined, shiftEnd: undefined },
    Tuesday: { display: true },
    Wednesday: { display: true },
    Thursday: { display: true },
    Friday: { display: true },
    Saturday: { display: true },
    Sunday: { display: true }
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
      absenceName: string;
      explRequired: boolean;
      attachRequired: boolean;
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
      <FlexColumn>
        <ControlLabel required={true}>Name</ControlLabel>
        <FormControl
          {...formProps}
          name="absenceName"
          defaultValue={absenceType && absenceType.name}
          required={true}
          autoFocus={true}
        />
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
      <FlexColumn>
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

  const onConfigDayStartTimeChange = (newTime: Date, dayName: string) => {
    const newConfigDays = configDays;
    newConfigDays[dayName].shiftStart = newTime;
    setConfigDays({ ...newConfigDays });
  };

  const onConfigDayEndTimeChange = (newTime: Date, dayName: string) => {
    configDays[dayName].shiftEnd = newTime;
    setConfigDays({ ...configDays });
  };

  const onContentTypeSelect = contntType => {
    localStorage.setItem('contentType', JSON.stringify(contntType));
    const contType = JSON.parse(localStorage.getItem('contentType') || '[]')
      .value;
    setContentType(contType);
  };

  const toggleWeekDays = dayKey => {
    const oldConfigBoolean = {
      ...configDays[dayKey],
      display: !configDays[dayKey].display
    };
    const newConfigDays = { ...configDays, [dayKey]: oldConfigBoolean };
    setConfigDays(newConfigDays);
  };

  const renderWeekendSettings = () => {
    return (
      <>
        {Object.keys(configDays).map(weekDay => (
          <ScheduleConfig
            key={weekDay}
            weekDay={weekDay}
            toggleWeekDays={toggleWeekDays}
          />
        ))}
      </>
    );
  };

  const renderConfigDays = () => {
    return Object.keys(configDays).map(configDay => {
      return (
        <div
          key={configDay}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          {configDays[configDay].display && (
            <>
              {configDay}
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Datetime
                  defaultValue={new Date()}
                  dateFormat={false}
                  timeFormat="hh:mm a"
                  onChange={(val: any) =>
                    onConfigDayStartTimeChange(val, configDay)
                  }
                />
                <Datetime
                  defaultValue={new Date()}
                  dateFormat={false}
                  timeFormat="hh:mm a"
                  onChange={(val: any) =>
                    onConfigDayEndTimeChange(val, configDay)
                  }
                />
              </div>
            </>
          )}
        </div>
      );
    });
  };

  const renderScheduleContent = (formProps: IFormProps) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <ControlLabel required={true}>
          <strong>Name</strong>
        </ControlLabel>
        <FormControl
          {...formProps}
          name="holidayName"
          defaultValue={holiday && holiday.holidayName}
          required={true}
          autoFocus={true}
        />
        <ControlLabel>
          <strong>Set as Weekend</strong>
        </ControlLabel>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          {renderWeekendSettings()}
        </div>
        {renderConfigDays()}
      </div>
    );
  };

  const renderHolidayContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    return (
      <FlexColumn>
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
