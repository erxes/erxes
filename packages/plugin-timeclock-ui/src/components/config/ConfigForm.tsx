import {
  ConfigFormWrapper,
  CustomRangeContainer,
  FlexCenter,
  FlexColumn,
  FlexColumnMargined,
  FlexRow,
  FlexRowJustifyStart,
  ToggleDisplay,
  Trigger,
} from '../../styles';
import {
  IAbsence,
  IAbsenceType,
  IDeviceConfig,
  IPayDates,
  IScheduleConfig,
  IScheduleForm,
} from '../../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import DateTimePicker from '../datepicker/DateTimePicker';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import Select from 'react-select';
import { compareStartAndEndTime } from '../../utils';

import dayjs from 'dayjs';

type Props = {
  configType: string;
  absenceType?: IAbsenceType;
  scheduleConfig?: IScheduleConfig;
  deviceConfig?: IDeviceConfig;
  holiday?: IAbsence;
  payDate?: IPayDates;
  loading?: boolean;
  afterSave?: () => void;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const requestToTypes = {
  default: 'Default /Whom have "Manage timeclock" permission/',
  supervisor: 'Branch supervisor',
  individuals: 'Set individuals',
};

function ConfigForm(props: Props) {
  const { renderButton, scheduleConfig, deviceConfig } = props;
  const { absenceType, holiday, payDate } = props;

  const [requestTime, setRequestTime] = useState(
    absenceType?.requestTimeType || 'by day'
  );

  const [requestType, setRequestType] = useState(
    absenceType?.requestType || 'shift request'
  );

  const [requestToType, setRequestToType] = useState(
    absenceType?.requestToType || 'default'
  );

  const [hoursPerDay, setHoursPerDay] = useState(8);

  const [payPeriod, setPayPeriod] = useState('');

  const [explanationRequired, setExplRequired] = useState(
    (absenceType && absenceType.explRequired) || false
  );

  const [startFlexible, setStartFlexible] = useState(
    (scheduleConfig && scheduleConfig.startFlexible) || false
  );

  const [endFlexible, setEndFlexible] = useState(
    (scheduleConfig && scheduleConfig.endFlexible) || false
  );

  const [scheduleOvertimeExists, setScheduleOverTimeExists] = useState(
    (scheduleConfig && scheduleConfig.overtimeExists) || false
  );

  const [attachmentRequired, setAttachRequired] = useState(
    (absenceType && absenceType.attachRequired) || false
  );

  const [deviceExtractRequired, setDeviceExtractRequired] = useState(
    (deviceConfig && deviceConfig.extractRequired) || false
  );

  const [locationsFormValues, setLocationsFormValues] = useState<any>(
    scheduleConfig?.locations || []
  );

  const [absenceUserIds, setAbsenceUserIds] = useState(
    (absenceType && absenceType.absenceUserIds) || []
  );

  const [branchIds, setBranchIds] = useState(
    (absenceType && absenceType.branchIds) || []
  );

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

  const configDaysTime: IScheduleForm = {
    configTime: {
      shiftStart: shiftStartTime,
      shiftEnd: shiftEndTime,
    },
    validCheckIn: {
      shiftStart: defaultStartTime,
      shiftEnd: defaultEndTime,
    },
    validCheckout: {
      shiftStart: defaultStartTime,
      shiftEnd: defaultEndTime,
    },
    overtime: {
      shiftStart: defaultStartTime,
      shiftEnd: defaultEndTime,
    },
  };

  const [isSubmitted, setSubmitted] = useState(false);

  scheduleConfig?.configDays.forEach((configDay) => {
    configDaysTime[configDay.configName].shiftStart = new Date(
      new Date().toLocaleDateString() + ' ' + configDay.configShiftStart
    );
    configDaysTime[configDay.configName].shiftEnd = new Date(
      new Date().toLocaleDateString() + ' ' + configDay.configShiftEnd
    );
  });

  const [configDays, setConfigDays] = useState<IScheduleForm>({
    ...configDaysTime,
  });

  const [holidayDates, setHolidayDates] = useState({
    startingDate: (holiday && holiday.startTime) || null,
    endingDate: (holiday && holiday.endTime) || null,
  });
  const [payDates, setpayDates] = useState({
    date1: new Date(),
    date2: new Date(),
  });

  const [isHovered, setIsHovered] = useState(false);

  const { afterSave, closeModal } = props;

  const onRequestToTypeChange = (e) => {
    setRequestToType(e.value);
  };

  const toggleRequestType = (e) => {
    setRequestType(e.value);
  };
  const toggleRequestTime = (e) => {
    setRequestTime(e.value);
  };
  const togglePayPeriod = (e) => {
    setPayPeriod(e.target.value);
  };
  const onAbsenceHoursPerDay = (e) => {
    setHoursPerDay(parseInt(e.target.value, 10));
  };
  const toggleExplRequired = (e) => {
    setExplRequired(e.target.checked);
  };
  const toggleAttachRequired = (e) => {
    setAttachRequired(e.target.checked);
  };
  const toggleDeviceExtractRequired = (e) => {
    setDeviceExtractRequired(e.target.checked);
  };

  const onConfigDateChange = (dateNum: string, newDate: Date) => {
    payDates[dateNum] = newDate;
    setpayDates({ ...payDates });
  };
  const onHolidayStartDateChange = (newStartDate) => {
    setHolidayDates({ ...holidayDates, startingDate: newStartDate });
  };
  const onHolidayEndDateChange = (newEndDate) => {
    setHolidayDates({ ...holidayDates, endingDate: newEndDate });
  };

  const addLocationClick = () => {
    const newLocation = {
      name: '',
      longitude: '',
      latitude: '',
    };
    setLocationsFormValues((prevValues) => {
      // Make sure prevValues is an array
      if (!Array.isArray(prevValues)) {
        console.error('prevValues is not an array', prevValues);
        return [newLocation]; // Reset to an array with the new location
      }
      return [...prevValues, newLocation];
    });
  };

  const onUserSelect = (users) => {
    setAbsenceUserIds(users);
  };

  const onBranchSelect = (branches) => {
    setBranchIds(branches);
  };

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  const onLocationsFormValueChange = (locationNum, e, key) => {
    setLocationsFormValues((prevValues) => {
      const newValues = [...prevValues];
      if (newValues[locationNum]) {
        newValues[locationNum] = {
          ...newValues[locationNum],
          [key]: e.target.value,
        };
      }
      return newValues;
    });
  };

  const renderLocationsForm = () => {
    const remove = (index) => {
      setLocationsFormValues((prevValues) => {
        if (!Array.isArray(prevValues)) {
          console.error('prevValues is not an array', prevValues);
          return []; // Reset to an empty array
        }
        return prevValues.filter((_, i) => i !== index);
      });
    };

    return (
      <>
        {locationsFormValues.map((location, index) => {
          return (
            <FlexRow style={{ margin: '25px' }}>
              <Tip text={__('Remove')} placement="top">
                <Button
                  btnStyle="link"
                  onClick={() => remove(index)}
                  icon="times-circle"
                />
              </Tip>{' '}
              <ControlLabel required={true}>Location Name </ControlLabel>
              <div style={{ marginLeft: '1rem' }}>
                <FormControl
                  type="text"
                  name={`location${index}Name`}
                  value={location.name}
                  required={true}
                  onChange={(e) => onLocationsFormValueChange(index, e, 'name')}
                />
              </div>
              <FlexColumn $marginNum={25}>
                <FlexColumn $marginNum={10}>
                  <ControlLabel required={true}>Longitude:</ControlLabel>
                  <div style={{ marginLeft: '1rem' }}>
                    <FormControl
                      type="text"
                      name={`location${index}Long`}
                      value={location.longitude}
                      required={true}
                      onChange={(e) =>
                        onLocationsFormValueChange(index, e, 'longitude')
                      }
                    />
                  </div>
                </FlexColumn>
                <FlexColumn $marginNum={10}>
                  <ControlLabel required={true}>Latitude:</ControlLabel>
                  <div style={{ marginLeft: '1rem' }}>
                    <FormControl
                      type="text"
                      name={`location${index}Lat`}
                      value={location.latitude}
                      required={true}
                      onChange={(e) =>
                        onLocationsFormValueChange(index, e, 'latitude')
                      }
                    />
                  </div>
                </FlexColumn>
              </FlexColumn>
            </FlexRow>
          );
        })}
      </>
    );
  };

  const checkLocationsFormValues = () => {
    for (const num of Object.keys(locationsFormValues)) {
      if (
        locationsFormValues[num].name === '' ||
        locationsFormValues[num].longitude === '' ||
        locationsFormValues[num].latitude === ''
      ) {
        return false;
      }
    }

    return true;
  };

  const generateDoc = (
    values: {
      _id?: string;
      holidayName?: string;
      startDate?: Date;
      endDate?: Date;
      absenceName?: string;
      scheduleName?: string;
      lunchBreak: number;
      explRequired?: boolean;
      attachRequired?: boolean;
      shiftRequest?: boolean;
      deviceName?: string;
      serialNo?: string;
      extractRequired?: boolean;
    },
    name: string
  ) => {
    switch (name) {
      case 'absenceType':
        if (absenceType) {
          values._id = absenceType._id;
        }
        let generateValues: any = {
          name: values.absenceName,

          requestType: `${requestType}`,
          requestTimeType: requestTime,
          requestToType: requestToType,

          explRequired: explanationRequired,
          attachRequired: attachmentRequired,
          absenceUserIds: absenceUserIds,
          branchIds: branchIds,
          shiftRequest: requestType === 'shift request',
          _id: values._id,
        };

        if (requestTime === 'by day') {
          generateValues = {
            ...generateValues,
            requestHoursPerDay: hoursPerDay || 8,
          };
        }

        return generateValues;

      case 'holiday':
        if (holiday) {
          values._id = holiday._id;
        }

        return {
          _id: values._id,
          name: values.holidayName,
          startDate: holidayDates.startingDate,
          endDate: holidayDates.endingDate,
        };

      case 'payDate':
        if (payDate) {
          values._id = payDate._id;
        }

        return {
          _id: values._id,
          dateNums:
            payPeriod === 'twice'
              ? Object.values(payDates).map((date) => date.getDate())
              : [payDates.date1.getDate()],
        };

      case 'schedule':
        const returnVariables: {
          _id?: string;
          scheduleName?: string;
          lunchBreakInMins?: number;
          configShiftStart?: string;
          configShiftEnd?: string;
          scheduleConfig: any[];
          locations?: any[];
          overtimeExists?: boolean;
          startFlexible?: boolean;
          endFlexible?: boolean;
        } = {
          scheduleName: values.scheduleName,
          scheduleConfig: [],
        };
        if (scheduleConfig) {
          returnVariables._id = scheduleConfig._id;
        }
        const timeFormat = 'HH:mm';

        returnVariables.lunchBreakInMins = parseInt(`${values.lunchBreak}`, 10);

        // validcheckin
        const validCheckIn = {
          ...configDays.validCheckIn,
          shiftEnd: startFlexible
            ? configDays.validCheckIn.shiftEnd
            : configDays.validCheckIn.shiftStart,
          overnightShift: configDays.validCheckIn.overnightShift,
          configName: 'validCheckIn',
        };

        // validcheckout
        const validCheckout = {
          ...configDays.validCheckout,
          shiftEnd: endFlexible
            ? configDays.validCheckout.shiftEnd
            : configDays.validCheckout.shiftStart,
          overnightShift: configDays.validCheckout.overnightShift,
          configName: 'validCheckout',
        };

        // overtime
        const overtime = {
          ...configDays.overtime,
          configName: 'overtime',
        };

        // config time
        returnVariables.configShiftStart = dayjs(
          configDays.validCheckIn.shiftStart
        ).format(timeFormat);

        returnVariables.configShiftEnd = dayjs(
          configDays.validCheckout.shiftStart
        ).format(timeFormat);

        // schedule config shifts
        returnVariables.scheduleConfig.push(
          validCheckIn,
          validCheckout,
          overtime
        );

        returnVariables.overtimeExists = scheduleOvertimeExists;
        returnVariables.startFlexible = startFlexible;
        returnVariables.endFlexible = endFlexible;

        if (
          Object.keys(locationsFormValues).length &&
          !checkLocationsFormValues()
        ) {
          return null;
        }

        returnVariables.locations = [];

        for (const location of Object.values(locationsFormValues)) {
          returnVariables.locations.push(location);
        }

        return returnVariables;

      case 'deviceConfig':
        if (deviceConfig) {
          values._id = deviceConfig._id;
        }

        return {
          _id: values._id,
          deviceName: values.deviceName,
          serialNo: values.serialNo,
          extractRequired: deviceExtractRequired,
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
      case 'Devices':
        return <Form renderContent={renderDevicesContent} />;
      // Absence
      default:
        return <Form renderContent={renderAbsenceContent} />;
    }
  };

  const beforeSubmit = () => {
    setSubmitted(true);
  };
  const renderDevicesContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <FlexColumn $marginNum={20}>
        <ControlLabel required={true}>Device Name</ControlLabel>
        <FormControl
          {...formProps}
          name="deviceName"
          defaultValue={deviceConfig && deviceConfig.deviceName}
          required={true}
          autoFocus={true}
        />

        <ControlLabel required={true}>Serial No.</ControlLabel>
        <FormControl
          {...formProps}
          name="serialNo"
          defaultValue={deviceConfig && deviceConfig.serialNo}
          required={true}
        />

        <FlexRow>
          <ControlLabel>Extract from device</ControlLabel>
          <FormControl
            name="extractRequired"
            defaultChecked={deviceExtractRequired}
            componentclass="checkbox"
            onChange={toggleDeviceExtractRequired}
          />
        </FlexRow>

        <FlexCenter style={{ marginTop: '10px' }}>
          {renderButton({
            name: 'deviceConfig',
            values: generateDoc(values, 'deviceConfig'),
            isSubmitted,
            beforeSubmit,
            callback: closeModal || afterSave,
            object: deviceConfig || null,
          })}
        </FlexCenter>
      </FlexColumn>
    );
  };

  const renderAbsenceContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    const requestOptions = [
      'shift request',
      'paid absence',
      'unpaid absence',
    ].map((ipt) => ({
      value: ipt,
      label: __(ipt),
    }));

    const periosOptions = ['by day', 'by hour'].map((ipt) => ({
      value: ipt,
      label: __(ipt),
    }));

    const renderRequestToTypes = (array) => {
      return array.map((ipt) => ({
        value: ipt,
        label: __(requestToTypes[ipt]),
      }));
    };

    return (
      <ConfigFormWrapper>
        <FlexColumn $marginNum={30}>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="absenceName"
            defaultValue={absenceType && absenceType.name}
            required={true}
            autoFocus={true}
          />

          <ControlLabel required={true}>Request Type</ControlLabel>

          <Select
            value={requestOptions.find((o) => o.value === requestType)}
            onChange={toggleRequestType}
            placeholder="Select type"
            isMulti={false}
            isClearable={true}
            options={['shift request', 'paid absence', 'unpaid absence'].map(
              (ipt) => ({
                value: ipt,
                label: __(ipt),
              })
            )}
          />

          <ControlLabel required={true}>Request Time Period</ControlLabel>

          <Select
            value={periosOptions.find((o) => o.value === requestTime)}
            onChange={toggleRequestTime}
            placeholder="Select type"
            isMulti={false}
            options={['by day', 'by hour'].map((ipt) => ({
              value: ipt,
              label: __(ipt),
            }))}
          />
          <ToggleDisplay display={requestTime === 'by day'}>
            <FlexRow>
              <ControlLabel>Hour(s) per day</ControlLabel>
              <div style={{ width: '20%' }}>
                <FormControl
                  type="number"
                  inline={true}
                  align="center"
                  value={hoursPerDay}
                  onChange={onAbsenceHoursPerDay}
                />
              </div>
            </FlexRow>
          </ToggleDisplay>

          <FlexRow>
            <ControlLabel>Explanation Required</ControlLabel>
            <FormControl
              name="explRequired"
              componentclass="checkbox"
              defaultChecked={explanationRequired}
              onChange={toggleExplRequired}
            />
          </FlexRow>
          <FlexRow>
            <ControlLabel>Attachment Required</ControlLabel>
            <FormControl
              name="attachRequired"
              componentclass="checkbox"
              defaultChecked={attachmentRequired}
              onChange={toggleAttachRequired}
            />
          </FlexRow>

          <ControlLabel required={true}>Send request to</ControlLabel>

          <Select
            value={renderRequestToTypes(Object.keys(requestToTypes)).find(
              (option) => option.value === requestToType
            )}
            onChange={onRequestToTypeChange}
            placeholder="Select type"
            options={renderRequestToTypes(Object.keys(requestToTypes))}
          />

          {requestToType === 'individuals' && (
            <>
              <ControlLabel required={true}>Select team members</ControlLabel>

              <SelectTeamMembers
                customField="employeeId"
                label={'Team member'}
                onSelect={onUserSelect}
                initialValue={absenceUserIds}
                multi={true}
                name="userId"
              />
            </>
          )}

          {requestToType === 'supervisor' && (
            <>
              <ControlLabel required={true}>Select branches</ControlLabel>

              <SelectBranches
                label="Choose branch"
                name="branchId"
                initialValue={branchIds || []}
                customOption={{
                  value: '',
                  label: '...Clear branch filter',
                }}
                onSelect={onBranchSelect}
                multi={true}
              />
            </>
          )}

          <FlexCenter style={{ marginTop: '10px' }}>
            {renderButton({
              name: 'absenceType',
              values: generateDoc(values, 'absenceType'),
              isSubmitted,
              callback: closeModal || afterSave,
              object: absenceType || null,
            })}
          </FlexCenter>
        </FlexColumn>
      </ConfigFormWrapper>
    );
  };

  const renderPayDateContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;
    return (
      <FlexColumn $marginNum={10}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ControlLabel>Pay period</ControlLabel>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: '10px',
            }}
          >
            <div>Once</div>
            <FormControl
              rows={2}
              name="payPeriod"
              componentclass="radio"
              options={['once', 'twice'].map((el) => ({
                value: el,
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
            object: payDate || null,
          })}
        </FlexCenter>
      </FlexColumn>
    );
  };

  const renderScheduleContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    return (
      <FlexColumn $marginNum={20}>
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

        <FlexColumnMargined $marginNum={25}>
          {renderConfigTime(formProps)}
        </FlexColumnMargined>

        <FlexCenter style={{ marginTop: '10px' }}>
          {renderButton({
            name: 'schedule',
            values: generateDoc(values, 'schedule'),
            isSubmitted,
            callback: closeModal || afterSave,
            object: scheduleConfig || null,
          })}
        </FlexCenter>
      </FlexColumn>
    );
  };

  const renderHolidayContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    return (
      <FlexColumn $marginNum={20}>
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
            object: holiday || null,
          })}
        </FlexCenter>
      </FlexColumn>
    );
  };

  const onStartTimeChange = (day_key, time_val) => {
    const newShift = configDays[day_key];
    const [getCorrectStartTime, getCorrectEndTime, overnight] =
      compareStartAndEndTime(configDays, day_key, time_val, null);

    newShift.shiftStart = getCorrectStartTime;
    newShift.overnightShift = overnight;
    newShift.shiftEnd = getCorrectEndTime;

    const newconfigDays = { ...configDays, [day_key]: newShift };
    setConfigDays(newconfigDays);
  };

  const onEndTimeChange = (day_key, time_val) => {
    const newShift = configDays[day_key];
    const [getCorrectStartTime, getCorrectEndTime, overnight] =
      compareStartAndEndTime(configDays, day_key, null, time_val);

    newShift.shiftStart = getCorrectStartTime;
    newShift.overnightShift = overnight;
    newShift.shiftEnd = getCorrectEndTime;

    const newconfigDays = { ...configDays, [day_key]: newShift };
    setConfigDays(newconfigDays);
  };

  const renderConfigTime = (formProps: IFormProps) => {
    return (
      <>
        <FlexRow>
          <ControlLabel>Check in</ControlLabel>
          <FlexRowJustifyStart $widthPercent={50}>
            <ControlLabel>Flexible</ControlLabel>
            <FormControl
              name="startFlexible"
              componentclass="checkbox"
              defaultChecked={startFlexible}
              onChange={() => setStartFlexible(!startFlexible)}
            />

            <DateTimePicker
              curr_day_key={'validCheckIn'}
              startDate={configDays.validCheckIn.shiftStart}
              startTime_value={configDays.validCheckIn.shiftStart}
              endTime_value={configDays.validCheckIn.shiftEnd}
              overnightShift={configDays.validCheckIn.overnightShift}
              changeEndTime={onEndTimeChange}
              changeStartTime={onStartTimeChange}
              timeOnly={true}
              flexitbleTime={startFlexible}
            />
          </FlexRowJustifyStart>
        </FlexRow>
        <FlexRow>
          <ControlLabel> Check out</ControlLabel>

          <FlexRowJustifyStart $widthPercent={50}>
            <ControlLabel>Flexible</ControlLabel>
            <FormControl
              name="endFlexible"
              componentclass="checkbox"
              defaultChecked={endFlexible}
              onChange={() => setEndFlexible(!endFlexible)}
            />

            <DateTimePicker
              curr_day_key={'validCheckout'}
              startDate={configDays.validCheckout.shiftStart}
              startTime_value={configDays.validCheckout.shiftStart}
              endTime_value={configDays.validCheckout.shiftEnd}
              overnightShift={configDays.validCheckout.overnightShift}
              changeEndTime={onEndTimeChange}
              changeStartTime={onStartTimeChange}
              timeOnly={true}
              flexitbleTime={endFlexible}
            />
          </FlexRowJustifyStart>
        </FlexRow>

        <FlexRow>
          <ControlLabel>Lunch break</ControlLabel>

          <FlexRowJustifyStart $widthPercent={50}>
            <div style={{ width: '15%', textAlign: 'center' }}>
              <FormControl
                {...formProps}
                defaultValue={
                  scheduleConfig ? scheduleConfig?.lunchBreakInMins : 30
                }
                align="center"
                name="lunchBreak"
                type="number"
                required={true}
              />
            </div>
            <div>minutes</div>
          </FlexRowJustifyStart>
        </FlexRow>

        <FlexRow>
          <FlexRow $gapPx={16}>
            <ControlLabel>Overtime</ControlLabel>
            <FormControl
              name="scheduleOvertimeExists"
              componentclass="checkbox"
              defaultChecked={scheduleOvertimeExists}
              onChange={() =>
                setScheduleOverTimeExists(!scheduleOvertimeExists)
              }
            />
          </FlexRow>
          <FlexRowJustifyStart $widthPercent={50}>
            {scheduleOvertimeExists && (
              <DateTimePicker
                curr_day_key={'overtime'}
                startDate={configDays.overtime.shiftStart}
                startTime_value={configDays.overtime.shiftStart}
                endTime_value={configDays.overtime.shiftEnd}
                changeEndTime={onEndTimeChange}
                changeStartTime={onStartTimeChange}
                timeOnly={true}
                flexitbleTime={scheduleOvertimeExists}
              />
            )}
          </FlexRowJustifyStart>
        </FlexRow>

        <FlexRow>
          <Trigger
            type="trigger"
            $isHoverActionBar={isHovered}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div
              onClick={addLocationClick}
              className="passive"
              style={{ width: '100%' }}
            >
              Add locations
            </div>
          </Trigger>
        </FlexRow>
        {renderLocationsForm()}
      </>
    );
  };

  return renderConfigContent();
}

export default ConfigForm;
