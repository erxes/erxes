import * as dayjs from "dayjs";

import {
  BorderedTd,
  FlexRow,
  FlexRowLeft,
  RequestInfo,
  TimeclockInfo,
  TimeclockTableWrapper,
  ToggleButton,
} from "../../styles";
import {
  COLORS,
  dateOfTheMonthFormat,
  dayOfTheWeekFormat,
  timeFormat,
} from "../../constants";
import { IShift, IUserReport } from "../../types";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Table from "@erxes/ui/src/components/table";
import TimeForm from "../../containers/timeclock/TimeFormList";
import TimeclockActionBar from "./ActionBar";
import TimeclockEditForm from "./TimeclockEditForm";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  reportByUsers: [IUserReport] | [];
  totalCount: number;
  queryParams: any;

  currentUser: IUser;
  isCurrentUserAdmin: boolean;
  isCurrentUserSupervisor: boolean;

  startClockTime?: (userId: string) => void;

  timeclockEdit: (values: any) => void;
  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
};

const TimeclockList = (props: Props) => {
  const {
    reportByUsers,
    queryParams,
    getPagination,
    totalCount,
    timeclockEdit,
    currentUser,
    isCurrentUserAdmin,
    startClockTime,
    getActionBar,
    showSideBar,
  } = props;
  const { startDate, endDate } = queryParams;
  const [showModal, setShowModal] = useState(false);
  const [editTimeclock, setEditTimeclock] = useState({});
  const [isSideBarOpen, setIsOpen] = useState(
    localStorage.getItem("isSideBarOpen") === "true" ? true : false
  );

  let lastColumnIdx = 1;

  type Column = {
    columnNo: number;
    dateField: string;
    text: string;
    backgroundColor: string;
    date?: Date;
  };

  const daysAndDatesHeaders: { [dateField: string]: Column } = {};

  const onToggleSidebar = () => {
    const toggleIsOpen = !isSideBarOpen;
    setIsOpen(toggleIsOpen);
    localStorage.setItem("isSideBarOpen", toggleIsOpen.toString());
  };

  const prepareTableHeaders = () => {
    let startRange = dayjs(startDate);
    const endRange = dayjs(endDate);

    let columnNo = 1;

    while (startRange <= endRange) {
      const backgroundColor =
        startRange.toDate().getDay() === 0 || startRange.toDate().getDay() === 6
          ? COLORS.weekend
          : COLORS.white;

      const dateField = startRange.format(dateOfTheMonthFormat);

      daysAndDatesHeaders[dateField] = {
        columnNo,
        dateField,
        text: startRange.format(dateOfTheMonthFormat),
        backgroundColor,
        date: startRange.toDate(),
      };

      columnNo += 1;
      startRange = startRange.add(1, "day");
    }

    lastColumnIdx = columnNo;
  };

  const renderTableHeaders = () => {
    prepareTableHeaders();
    return (
      <thead>
        <tr>
          <th rowSpan={2} style={{ border: "1px solid #EEE" }}>
            {""}
          </th>
          <th
            rowSpan={2}
            style={{ textAlign: "center", border: "1px solid #EEE" }}
          >
            {__("Employee Id")}
          </th>
          <th
            rowSpan={2}
            style={{ border: "1px solid #EEE" }}
            className="fixed-column"
          >
            {__("Team members")}
          </th>

          {Object.keys(daysAndDatesHeaders).map((dateField) => {
            return (
              <th
                key={dateField}
                style={{
                  backgroundColor:
                    daysAndDatesHeaders[dateField].backgroundColor,
                  border: "1px solid #EEE",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {dayjs(daysAndDatesHeaders[dateField].date).format(
                  dayOfTheWeekFormat
                )}
              </th>
            );
          })}
        </tr>
        <tr>
          {Object.keys(daysAndDatesHeaders).map((dateField) => {
            return (
              <th
                key={dateField}
                style={{
                  backgroundColor:
                    daysAndDatesHeaders[dateField].backgroundColor,
                  border: "1px solid #EEE",
                  textAlign: "center",
                }}
              >
                {daysAndDatesHeaders[dateField].text}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  };

  const getAbsenceDayColor = (absenceType: string) => {
    switch (absenceType) {
      case "paid absence":
        return COLORS.paidAbsence;
      case "shift request":
        return COLORS.shiftRequest;
      case "unpaid absence":
        return COLORS.unpaidAbsence;

      default:
        return COLORS.blank;
    }
  };

  const renderEditForm = () => {
    return (
      <TimeclockEditForm
        timeclock={editTimeclock}
        timeclockEdit={timeclockEdit}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    );
  };

  const renderUserReportRow = (userReport: IUserReport) => {
    const { user, index, timeclocks, requests, schedules } = userReport;

    const timeclocksInfo: any = {};
    const requestsInfo: any = {};
    const scheduleShiftsInfo: any = {};
    const timeclocksObj: any = {};

    type TimeclocksInfo = {
      shiftStart: string;
      shiftEnd?: string;
    };
    type ShiftString = {
      absent?: boolean;
      shiftRequest?: boolean;
      paidAbsence?: boolean;
      unpaidAbsence?: boolean;
      shiftNotClosed?: boolean;

      timeclockInfo?: [TimeclocksInfo];

      backgroundColor?: string;

      requestStartTime?: string;
      requestEndTime?: string;

      scheduled?: boolean;
      timeclockExists?: boolean;
    };

    const renderUserInfo = (
      <>
        <td>{index}</td>
        <td>{user.employeeId || "-"}</td>
        <td
          style={{ width: "10%", textAlign: "left" }}
          className="fixed-column"
        >
          <div>
            {`${
              user.details?.lastName ? user.details?.lastName.charAt(0) : ""
            }.${user.details?.firstName ? user.details?.firstName : ""}` || "-"}
          </div>
          <div style={{ color: "#9f9f9f", wordWrap: "normal" }}>
            {user.details?.position}
          </div>
        </td>
      </>
    );

    const scheduleShifts: IShift[] = [];

    // scheduled: true
    if (schedules?.length) {
      for (const schedule of schedules) {
        if (schedule.shifts?.length) {
          scheduleShifts.push(...schedule.shifts);
        }
      }

      for (const scheduleShift of scheduleShifts) {
        const dateField = dayjs(scheduleShift.shiftStart).format(
          dateOfTheMonthFormat
        );

        scheduleShiftsInfo[dateField] = { scheduled: true };
      }
    }

    if (timeclocks?.length) {
      for (const timeclock of timeclocks) {
        // prevent showing duplicate timeclocks created by shift request
        if (
          timeclock.deviceType &&
          timeclock.deviceType.toLocaleLowerCase() === "shift request"
        ) {
          continue;
        }

        timeclocksObj[timeclock._id] = timeclock;

        const dateField = dayjs(timeclock.shiftStart).format(
          dateOfTheMonthFormat
        );

        const shiftStart = dayjs(timeclock.shiftStart).format(timeFormat);
        const shiftEnd = timeclock.shiftEnd
          ? dayjs(timeclock.shiftEnd).format(timeFormat)
          : "";
        // if multiple shifts on single day
        if (dateField in timeclocksInfo) {
          const prevTimeclock = timeclocksInfo[dateField];
          timeclocksInfo[dateField] = [
            {
              _id: timeclock._id,
              shiftStart,
              shiftEnd,
              shiftNotClosed: timeclock.shiftNotClosed,
              shiftActive: timeclock.shiftActive || !timeclock.shiftEnd,
            },
            ...prevTimeclock,
          ];

          continue;
        }

        timeclocksInfo[dateField] = [
          {
            _id: timeclock._id,
            shiftStart,
            shiftEnd,
            shiftNotClosed: timeclock.shiftNotClosed,
            deviceType: timeclock.deviceType,
            shiftActive: timeclock.shiftActive || !timeclock.shiftEnd,
          },
        ];
      }
    }

    if (requests?.length) {
      for (const request of requests) {
        const { absenceTimeType, reason } = request;

        const lowerCasedReason = reason.toLocaleLowerCase();
        // dont show check in | check out request
        if (
          lowerCasedReason.includes("check in") ||
          lowerCasedReason.includes("check out")
        ) {
          continue;
        }

        if (absenceTimeType === "by day") {
          const abseneDurationPerDay: string =
            (
              parseFloat(request.totalHoursOfAbsence) /
              request.requestDates.length
            ).toFixed(1) + " hours";

          for (const requestDate of request.requestDates) {
            const date = dayjs(new Date(requestDate)).format(
              dateOfTheMonthFormat
            );

            // if multiple requests per day
            if (date in requestsInfo) {
              requestsInfo[date].push({
                reason: request.reason,
                backgroundColor: getAbsenceDayColor(request.absenceType || ""),
                absenceDuration: abseneDurationPerDay,
              });

              continue;
            }

            requestsInfo[date] = [
              {
                reason: request.reason,
                backgroundColor: getAbsenceDayColor(request.absenceType || ""),
                absenceDuration: abseneDurationPerDay,
              },
            ];
          }

          continue;
        }

        const absenceDuration: string =
          dayjs(request.startTime).format(timeFormat) +
          "~" +
          dayjs(request.endTime).format(timeFormat);

        // by hour
        const dateField = dayjs(request.startTime).format(dateOfTheMonthFormat);

        if (dateField in requestsInfo) {
          requestsInfo[dateField].push({
            reason: request.reason,
            backgroundColor: getAbsenceDayColor(request.absenceType || ""),
            absenceDuration,
          });
          continue;
        }

        requestsInfo[dateField] = [
          {
            reason: request.reason,
            backgroundColor: getAbsenceDayColor(request.absenceType || ""),
            absenceDuration,
          },
        ];
      }
    }

    const listRowOnColumnOrder: any = [];

    for (const dateField of Object.keys(daysAndDatesHeaders)) {
      let emptyCell = true;
      const shiftCell = (
        <td
          style={{
            border: "1px solid #EEEEEE",
            backgroundColor: COLORS.blank,
          }}
        />
      );

      const contentInsideCell: any = [];

      const getDate = new Date(
        new Date(dateField).setFullYear(new Date().getFullYear())
      );
      // absent day
      if (
        !timeclocksInfo[dateField] &&
        !requestsInfo[dateField] &&
        scheduleShiftsInfo[dateField] &&
        getDate.getTime() < new Date().getTime()
      ) {
        contentInsideCell.push(
          <RequestInfo
            backgroundColor={COLORS.absent}
            borderColor={COLORS.absentBorder}
            textColor={COLORS.white}
          >
            Absent
          </RequestInfo>
        );

        emptyCell = false;
      }

      // add timeclock content
      if (dateField in timeclocksInfo) {
        contentInsideCell.push(
          timeclocksInfo[dateField].map((timeclock) => {
            return (
              <Tip
                text="Edit timeclock"
                placement="bottom-start"
                key={timeclock._id}
              >
                <TimeclockInfo
                  disabled={timeclock.shiftNotClosed}
                  activeShift={timeclock.shiftActive}
                  key={timeclock.shiftStart}
                  color={
                    timeclock.shiftNotClosed ? COLORS.shiftNotClosed : undefined
                  }
                  onClick={() => {
                    setShowModal(true);
                    setEditTimeclock(timeclocksObj[timeclock._id]);
                  }}
                >
                  {timeclock.shiftStart} ~ {timeclock.shiftEnd}
                </TimeclockInfo>
              </Tip>
            );
          })
        );
        emptyCell = false;
      }
      // add request content
      if (requestsInfo[dateField]) {
        requestsInfo[dateField].map((request) => {
          contentInsideCell.push(
            <Tip
              placement="bottom-start"
              text={`${request.reason}\n${request.absenceDuration}`}
            >
              <RequestInfo backgroundColor={request.backgroundColor}>
                {request.reason}
              </RequestInfo>
            </Tip>
          );
        });
        emptyCell = false;
      }

      listRowOnColumnOrder.push(
        emptyCell ? shiftCell : <BorderedTd>{contentInsideCell}</BorderedTd>
      );
    }

    return (
      <tr>
        {renderUserInfo}
        {listRowOnColumnOrder}
      </tr>
    );
  };

  const actionBarLeft = (
    <FlexRowLeft>
      <ToggleButton
        id="btn-inbox-channel-visible"
        $isActive={isSideBarOpen}
        onClick={onToggleSidebar}
      >
        <Icon icon="subject" />
      </ToggleButton>
    </FlexRowLeft>
  );

  const modalContent = (contenProps) => (
    <TimeForm {...contenProps} {...props} startClockTime={startClockTime} />
  );

  const trigger = (
    <Button btnStyle={"success"} icon="plus-circle">
      Start Shift
    </Button>
  );

  const actionBarRight = (
    <FlexRow>
      <TimeclockActionBar
        currentUserId={currentUser._id}
        isCurrentUserAdmin={isCurrentUserAdmin}
        queryParams={queryParams}
      />
      <ModalTrigger
        title={__("Start shift")}
        trigger={trigger}
        content={modalContent}
      />
    </FlexRow>
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={actionBarLeft}
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );

  getActionBar(actionBar);
  showSideBar(isSideBarOpen);
  getPagination(<Pagination count={totalCount} />);

  return (
    <TimeclockTableWrapper>
      <Table $bordered={true}>
        {renderTableHeaders()}
        {showModal && renderEditForm()}
        <tbody>
          {reportByUsers.map((r, i) =>
            renderUserReportRow({ ...r, index: i + 1 })
          )}
        </tbody>
      </Table>
    </TimeclockTableWrapper>
  );
};

export default TimeclockList;
