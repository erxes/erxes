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
} from "../../styles";
import {
  IAbsence,
  IAbsenceType,
  IDeviceConfig,
  IPayDates,
  IScheduleConfig,
  IScheduleForm,
} from "../../types";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useState } from "react";

import ControlLabel from "@erxes/ui/src/components/form/Label";
import DateControl from "@erxes/ui/src/components/form/DateControl";
import DateTimePicker from "../datepicker/DateTimePicker";
import Form from "@erxes/ui/src/components/form/Form";
import FormControl from "@erxes/ui/src/components/form/Control";
import Select from "react-select";
import { __ } from "@erxes/ui/src/utils";
import { compareStartAndEndTime } from "../../utils";
import dayjs from "dayjs";

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

function ConfigForm(props: Props) {
  const { renderButton, scheduleConfig, deviceConfig } = props;
  const { absenceType, holiday, payDate } = props;

  const [requestTime, setRequestTime] = useState(
    absenceType?.requestTimeType || "by day"
  );

  const [requestType, setRequestType] = useState(
    absenceType?.requestType || "shift request"
  );

  const [hoursPerDay, setHoursPerDay] = useState(8);

  const [payPeriod, setPayPeriod] = useState("");

  const [explanationRequired, setExplRequired] = useState(
    (absenceType && absenceType.explRequired) || false
  );

  const [scheduleStartFlexible, setScheduleStartFlexible] = useState(
    (absenceType && absenceType.explRequired) || false
  );

  const [scheduleEndFlexible, setScheduleEndFlexible] = useState(
    (absenceType && absenceType.explRequired) || false
  );

  const [scheduleOvertimeExists, setScheduleOverTimeExists] = useState(
    (absenceType && absenceType.explRequired) || false
  );

  const [attachmentRequired, setAttachRequired] = useState(
    (absenceType && absenceType.attachRequired) || false
  );

  const [deviceExtractRequired, setDeviceExtractRequired] = useState(
    (deviceConfig && deviceConfig.extractRequired) || false
  );

  const [numberOfLocations, setNumberOfLocations] = useState(0);
  const [numberOfLocationsArr, setNumberOfLocationsArr] = useState<any[]>([]);

  const defaultStartTime = new Date(
    new Date().toLocaleDateString() + " 08:30:00"
  );

  const defaultEndTime = new Date(
    new Date().toLocaleDateString() + " 17:00:00"
  );

  const shiftStartTime = new Date(
    new Date().toLocaleDateString() +
      " " +
      (scheduleConfig ? scheduleConfig.shiftStart : "08:30:00")
  );
  const shiftEndTime = new Date(
    new Date().toLocaleDateString() +
      " " +
      (scheduleConfig ? scheduleConfig.shiftEnd : "17:00:00")
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

  scheduleConfig?.configDays.forEach((configDay) => {
    configDaysTime[configDay.configName].shiftStart = new Date(
      new Date().toLocaleDateString() + " " + configDay.configShiftStart
    );
    configDaysTime[configDay.configName].shiftEnd = new Date(
      new Date().toLocaleDateString() + " " + configDay.configShiftEnd
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
    const nextNum = numberOfLocations + 1;
    setNumberOfLocations(nextNum);
    setNumberOfLocationsArr([...numberOfLocationsArr, nextNum]);
  };

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  const renderLocationsForm = () => {
    return (
      <>
        {numberOfLocationsArr.map((num) => (
          <FlexRow style={{ margin: "25px" }}>
            <ControlLabel>{num} . </ControlLabel>
            <ControlLabel>Location Name </ControlLabel>
            <div style={{ marginLeft: "1rem" }}>
              <FormControl type="text" />
            </div>

            <FlexColumn $marginNum={25}>
              <FlexColumn $marginNum={10}>
                <ControlLabel>Longitude:</ControlLabel>
                <div style={{ marginLeft: "1rem" }}>
                  <FormControl type="text" />
                </div>
              </FlexColumn>
              <FlexColumn $marginNum={10}>
                <ControlLabel>Lattitude:</ControlLabel>
                <div style={{ marginLeft: "1rem" }}>
                  <FormControl type="text" />
                </div>
              </FlexColumn>
            </FlexColumn>
          </FlexRow>
        ))}
      </>
    );
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
      case "absenceType":
        if (absenceType) {
          values._id = absenceType._id;
        }
        let generateValues: any = {
          name: values.absenceName,

          requestType: `${requestType}`,
          requestTimeType: requestTime,

          explRequired: explanationRequired,
          attachRequired: attachmentRequired,
          shiftRequest: requestType === "shift request",
          _id: values._id,
        };

        if (requestTime === "by day") {
          generateValues = {
            ...generateValues,
            requestHoursPerDay: hoursPerDay || 8,
          };
        }

        return generateValues;

      case "holiday":
        if (holiday) {
          values._id = holiday._id;
        }

        return {
          _id: values._id,
          name: values.holidayName,
          startDate: holidayDates.startingDate,
          endDate: holidayDates.endingDate,
        };

      case "payDate":
        if (payDate) {
          values._id = payDate._id;
        }

        return {
          _id: values._id,
          dateNums:
            payPeriod === "twice"
              ? Object.values(payDates).map((date) => date.getDate())
              : [payDates.date1.getDate()],
        };

      case "schedule":
        const returnVariables: {
          _id?: string;
          scheduleName?: string;
          lunchBreakInMins?: number;
          configShiftStart?: string;
          configShiftEnd?: string;
          scheduleConfig: any[];
        } = {
          scheduleName: values.scheduleName,
          scheduleConfig: [],
        };
        if (scheduleConfig) {
          returnVariables._id = scheduleConfig._id;
        }
        const timeFormat = "HH:mm";

        returnVariables.lunchBreakInMins = parseInt(`${values.lunchBreak}`, 10);

        Object.keys(configDays).forEach((day_key) => {
          if (day_key.toLocaleLowerCase() !== "configtime") {
            returnVariables.scheduleConfig.push({
              configName: day_key,
              shiftStart: configDays[day_key].shiftStart,
              shiftEnd: configDays[day_key].shiftEnd,
              overnightShift: configDays[day_key].overnightShift,
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

      case "deviceConfig":
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
      case "PayDate":
        return <Form renderContent={renderPayDateContent} />;
      case "Holiday":
        return <Form renderContent={renderHolidayContent} />;
      case "Schedule":
        return <Form renderContent={renderScheduleContent} />;
      case "Devices":
        return <Form renderContent={renderDevicesContent} />;
      // Absence
      default:
        return <Form renderContent={renderAbsenceContent} />;
    }
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

        <FlexCenter style={{ marginTop: "10px" }}>
          {renderButton({
            name: "deviceConfig",
            values: generateDoc(values, "deviceConfig"),
            isSubmitted,
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
      "shift request",
      "paid absence",
      "unpaid absence",
    ].map((ipt) => ({
      value: ipt,
      label: __(ipt),
    }));

    const periosOptions = ["by day", "by hour"].map((ipt) => ({
      value: ipt,
      label: __(ipt),
    }));

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
            options={["shift request", "paid absence", "unpaid absence"].map(
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
            options={["by day", "by hour"].map((ipt) => ({
              value: ipt,
              label: __(ipt),
            }))}
          />
          <ToggleDisplay display={requestTime === "by day"}>
            <FlexRow>
              <ControlLabel>Hour(s) per day</ControlLabel>
              <div style={{ width: "20%" }}>
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
          <FlexCenter style={{ marginTop: "10px" }}>
            {renderButton({
              name: "absenceType",
              values: generateDoc(values, "absenceType"),
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <ControlLabel>Pay period</ControlLabel>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              gap: "10px",
            }}
          >
            <div>Once</div>
            <FormControl
              rows={2}
              name="payPeriod"
              componentclass="radio"
              options={["once", "twice"].map((el) => ({
                value: el,
              }))}
              inline={true}
              onChange={togglePayPeriod}
            />
            <div>Twice</div>
          </div>
        </div>
        <CustomRangeContainer>
          {payPeriod === "" ? (
            <></>
          ) : (
            <>
              <DateControl
                value={payDates.date1}
                required={false}
                onChange={(val: any) => onConfigDateChange("date1", val)}
                placeholder={"Enter date"}
                dateFormat={"YYYY-MM-DD"}
              />
              {payPeriod === "twice" ? (
                <DateControl
                  value={payDates.date2}
                  required={false}
                  onChange={(val: any) => onConfigDateChange("date2", val)}
                  placeholder={"Enter date"}
                  dateFormat={"YYYY-MM-DD"}
                />
              ) : (
                <></>
              )}
            </>
          )}
        </CustomRangeContainer>
        <FlexCenter style={{ marginTop: "10px" }}>
          {renderButton({
            name: "payDate",
            isSubmitted,
            values: generateDoc(values, "payDate"),
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

        <FlexCenter style={{ marginTop: "10px" }}>
          {renderButton({
            name: "schedule",
            values: generateDoc(values, "schedule"),
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
            placeholder={"Starting date"}
            dateFormat={"YYYY-MM-DD"}
          />
          <DateControl
            value={holidayDates.endingDate}
            required={false}
            onChange={onHolidayEndDateChange}
            placeholder={"Ending date"}
            dateFormat={"YYYY-MM-DD"}
          />
        </CustomRangeContainer>
        <FlexCenter style={{ marginTop: "10px" }}>
          {renderButton({
            name: "holiday",
            values: generateDoc(values, "holiday"),
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
          <FlexRowJustifyStart widthPercent={50}>
            <ControlLabel>Flexible</ControlLabel>
            <FormControl
              name="scheduleStartFlexible"
              componentclass="checkbox"
              defaultChecked={scheduleStartFlexible}
              onChange={() => setScheduleStartFlexible(!scheduleStartFlexible)}
            />

            <DateTimePicker
              curr_day_key={"configTime"}
              startDate={configDays.configTime.shiftStart}
              startTime_value={configDays.configTime.shiftStart}
              endTime_value={configDays.configTime.shiftEnd}
              overnightShift={configDays.configTime.overnightShift}
              changeEndTime={onEndTimeChange}
              changeStartTime={onStartTimeChange}
              timeOnly={true}
              flexitbleTime={scheduleStartFlexible}
            />
          </FlexRowJustifyStart>
        </FlexRow>
        <FlexRow>
          <ControlLabel> Check out</ControlLabel>

          <FlexRowJustifyStart widthPercent={50}>
            <ControlLabel>Flexible</ControlLabel>
            <FormControl
              name="scheduleEndFlexible"
              componentclass="checkbox"
              defaultChecked={scheduleEndFlexible}
              onChange={() => setScheduleEndFlexible(!scheduleEndFlexible)}
            />

            <DateTimePicker
              curr_day_key={"configTime"}
              startDate={configDays.configTime.shiftStart}
              startTime_value={configDays.configTime.shiftStart}
              endTime_value={configDays.configTime.shiftEnd}
              overnightShift={configDays.configTime.overnightShift}
              changeEndTime={onEndTimeChange}
              changeStartTime={onStartTimeChange}
              timeOnly={true}
              flexitbleTime={scheduleEndFlexible}
            />
          </FlexRowJustifyStart>
        </FlexRow>

        <FlexRow>
          <ControlLabel>Lunch break</ControlLabel>

          <FlexRowJustifyStart widthPercent={50}>
            <div style={{ width: "10%", textAlign: "center" }}>
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
          <FlexRow gapPx={16}>
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
          <FlexRowJustifyStart widthPercent={50}>
            {scheduleOvertimeExists && (
              <DateTimePicker
                curr_day_key={"overtime"}
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
              style={{ width: "100%" }}
            >
              Add locations
            </div>
          </Trigger>
          {/* <Button btnStyle='primary' onClick={addLocationClick}></Button> */}
        </FlexRow>
        {renderLocationsForm()}
      </>
    );
  };

  return renderConfigContent();
}

export default ConfigForm;
