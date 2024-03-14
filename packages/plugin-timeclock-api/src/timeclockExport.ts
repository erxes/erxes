import * as dayjs from 'dayjs';
import * as xlsxPopulate from 'xlsx-populate';
import { IModels } from './connectionResolver';
import { TIMECLOCK_EXPORT_COLUMNS } from './constants';
import { timeclockReportByUsers } from './graphql/resolvers/utils';
import { ITeamMembersObj, IUserReport } from './models/definitions/timeclock';
import {
  createTeamMembersObjectWithFullName,
  findTeamMember,
  findTeamMembers,
  generateCommonUserIds,
  getNextNthColumnChar,
  returnSupervisedUsers,
} from './utils';

import {
  findTimeclockTeamMemberIds,
  paginateArray,
} from '../src/graphql/resolvers/utils';

type Column = {
  dateField: string;
  text: string;
  date: Date;
};

const daysAndDatesHeaders: { [dateField: string]: Column } = {};
const dateFormat = 'YYYY.MM.DD';
const dayOfTheWeekFormat = 'dd';
const dateOfTheMonthFormat = 'MM/DD';
const timeFormat = 'HH:mm';

/**
 * Creates blank workbook
 */
export const createXlsFile = async () => {
  // Generating blank workbook
  const workbook = await xlsxPopulate.fromBlankAsync();

  return { workbook, sheet: workbook.sheet(0) };
};

/**
 * Generates downloadable xls file on the url
 */
export const generateXlsx = async (workbook: any): Promise<string> => {
  return workbook.outputAsync();
};

const addIntoSheet = async (
  values: any,
  startRowIdx: string,
  endRowIdx: string,
  sheet: any,
  merged?: boolean,
  customStyles?: any,
) => {
  const r = sheet.range(`${startRowIdx}:${endRowIdx}`);

  r.style('horizontalAlignment', 'center');

  if (merged) {
    r.style({ horizontalAlignment: 'center', verticalAlignment: 'center' });
    r.merged(true);
    r.style('bold', true);
  }

  if (customStyles) {
    for (const cStyle of customStyles) {
      r.style(cStyle.style, cStyle.value);
    }
  }

  r.value(values);
};

const prepareHeader = async (sheet: any, startDate: Date, endDate: Date) => {
  const timeclock_headers = [...TIMECLOCK_EXPORT_COLUMNS];

  let column_start = 'A';
  let column_end = 'A';

  let total_columns = 0;

  let startRange = dayjs(startDate);
  const endRange = dayjs(endDate);

  const days: string[] = [];
  const dates: string[] = [];

  for (const header of timeclock_headers) {
    total_columns += header[1].length;
    column_end = getNextNthColumnChar(column_start, header[1].length - 1);

    if (!header[0][0].length) {
      addIntoSheet(
        [header[1]],
        `${column_start}1`,
        `${column_end}2`,
        sheet,
        true,
      );
      column_start = getNextNthColumnChar(column_end, 1);
      continue;
    }

    addIntoSheet(
      [header[0]],
      `${column_start}1`,
      `${column_end}1`,
      sheet,
      true,
    );
    addIntoSheet([header[1]], `${column_start}2`, `${column_end}2`, sheet);
    column_start = getNextNthColumnChar(column_end, 1);
  }

  while (startRange <= endRange) {
    days.push(startRange.format(dayOfTheWeekFormat));
    dates.push(startRange.format(dateOfTheMonthFormat));

    const dateField = startRange.format(dateOfTheMonthFormat);

    daysAndDatesHeaders[dateField] = {
      dateField,
      text: startRange.format(dateOfTheMonthFormat),
      date: startRange.toDate(),
    };

    total_columns += 1;
    startRange = startRange.add(1, 'day');
  }

  column_end = getNextNthColumnChar(column_start, days.length - 1);

  addIntoSheet([days], `${column_start}1`, `${column_end}1`, sheet, false);
  addIntoSheet([dates], `${column_start}2`, `${column_end}2`, sheet, false, [
    {
      style: 'bold',
      value: true,
    },
  ]);

  sheet.column('B').width(50);
  sheet.column('C').width(20);

  return total_columns;
};

const changeColumnRangeWidths = async (
  sheet: any,
  colStart: string,
  colEnd: string,
  width: number,
) => {
  let startRange = colStart;

  while (startRange !== colEnd) {
    sheet.column(startRange).width(width);
    startRange = getNextNthColumnChar(startRange, 1);
  }

  sheet.column(colEnd).width(width);
};

const extractAndAddIntoSheet = async (
  models: any,
  sheet: any,
  empReports: any[],
  teamMembersObj: { [userId: string]: any },
  total_columns: number,
) => {
  const rowStartIdx = 3;
  const colStart = 'A';
  let dataIdx = 1;

  const totalRowsData: any = [];

  for (const empReport of empReports) {
    const { userId, requests, timeclocks, schedules } = empReport;

    const timeclocksInfo: any = {};
    const requestsInfo: any = {};
    const scheduleShiftsInfo: any = {};

    // const scheduleShifts: IShift[] = [];
    const getUserInfo: {
      fullName: string;
      position: string;
      employeeId: string;
    } = teamMembersObj[userId || ''];

    const rowData: any = [];

    if (getUserInfo) {
      const { fullName, employeeId, position } = getUserInfo;
      rowData.push(dataIdx, fullName, employeeId);
      dataIdx += 1;
    }

    // scheduled: true
    if (schedules?.length) {
      const scheduleIds = schedules.map((schedule: any) => schedule._id);
      const scheduleShifts = await models.Shifts.find({
        scheduleId: { $in: scheduleIds },
      });

      for (const scheduleShift of scheduleShifts) {
        const dateField = dayjs(scheduleShift.shiftStart).format(
          dateOfTheMonthFormat,
        );

        scheduleShiftsInfo[dateField] = { scheduled: true };
      }
    }

    if (timeclocks?.length) {
      for (const timeclock of timeclocks) {
        // prevent showing duplicate timeclocks created by shift request
        if (
          timeclock.deviceType &&
          timeclock.deviceType.toLocaleLowerCase() === 'shift request'
        ) {
          continue;
        }

        const dateField = dayjs(timeclock.shiftStart).format(
          dateOfTheMonthFormat,
        );

        const shiftStart = dayjs(timeclock.shiftStart).format(timeFormat);
        const shiftEnd = timeclock.shiftEnd
          ? dayjs(timeclock.shiftEnd).format(timeFormat)
          : '';
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
          lowerCasedReason.includes('check in') ||
          lowerCasedReason.includes('check out')
        ) {
          continue;
        }

        if (absenceTimeType === 'by day') {
          const abseneDurationPerDay: string =
            (
              parseFloat(request.totalHoursOfAbsence) /
              request.requestDates.length
            ).toFixed(1) + ' hours';

          for (const requestDate of request.requestDates) {
            const date = dayjs(new Date(requestDate)).format(
              dateOfTheMonthFormat,
            );

            // if multiple requests per day
            if (date in requestsInfo) {
              requestsInfo[date].push({
                reason: request.reason,
                absenceDuration: abseneDurationPerDay,
              });

              continue;
            }

            requestsInfo[date] = [
              {
                reason: request.reason,
                absenceDuration: abseneDurationPerDay,
              },
            ];
          }

          continue;
        }

        const absenceDuration: string =
          dayjs(request.startTime).format(timeFormat) +
          '~' +
          dayjs(request.endTime).format(timeFormat);

        // by hour
        const dateField = dayjs(request.startTime).format(dateOfTheMonthFormat);

        if (dateField in requestsInfo) {
          requestsInfo[dateField].push({
            reason: request.reason,
            absenceDuration,
          });
          continue;
        }

        requestsInfo[dateField] = [
          {
            reason: request.reason,
            absenceDuration,
          },
        ];
      }
    }

    const timeclockData: string[] = [];

    for (const dateField of Object.keys(daysAndDatesHeaders)) {
      const contentInsideCell: string[] = [];
      let emptyCell = true;

      const getDate = new Date(
        new Date(dateField).setFullYear(new Date().getFullYear()),
      );

      // absent day
      if (
        !timeclocksInfo[dateField] &&
        !requestsInfo[dateField] &&
        scheduleShiftsInfo[dateField] &&
        getDate.getTime() < new Date().getTime()
      ) {
        contentInsideCell.push('Absent');
        emptyCell = false;
      }

      // add timeclock content
      if (dateField in timeclocksInfo) {
        for (const timeclock of timeclocksInfo[dateField]) {
          contentInsideCell.push(
            `${timeclock.shiftStart} ~ ${
              timeclock.shiftActive ? 'A' : timeclock.shiftEnd
            }`,
          );
        }
        emptyCell = false;
      }

      // add request content
      if (requestsInfo[dateField]) {
        requestsInfo[dateField].map((request) => {
          contentInsideCell.push(
            `${request.reason}\n${request.absenceDuration}`,
          );
        });
        emptyCell = false;
      }

      sheet.row(rowStartIdx + dataIdx).style('verticalAlignment', 'center');
      sheet.row(rowStartIdx + dataIdx).height(contentInsideCell.length * 60);
      timeclockData.push(emptyCell ? '-' : contentInsideCell.join('\n'));
    }

    if (timeclockData.length) {
      rowData.push(...timeclockData);
    }

    totalRowsData.push(rowData);
  }

  const rowEndIdx = rowStartIdx + dataIdx;
  const colEnd = getNextNthColumnChar(colStart, total_columns - 1);
  addIntoSheet(
    totalRowsData,
    `${colStart}${rowStartIdx}`,
    `${colEnd}${rowEndIdx}`,
    sheet,
    false,
  );

  changeColumnRangeWidths(sheet, 'D', colEnd, 20);
};

export const buildFile = async (
  models: IModels,
  subdomain: string,
  params: any,
) => {
  const {
    currentUserId,
    isCurrentUserAdmin,
    page,
    perPage,
    startDate,
    endDate,
  } = params;

  const userIds =
    params.userIds instanceof Array || !params.userIds
      ? params.userIds
      : [params.userIds];

  const branchIds =
    params.branchIds instanceof Array || !params.branchIds
      ? params.branchIds
      : [params.branchIds];
  const departmentIds =
    params.departmentIds instanceof Array || !params.departmentIds
      ? params.departmentIds
      : [params.departmentIds];

  const currentUser = await findTeamMember(subdomain, currentUserId);

  const startDateFormatted = dayjs(startDate).format(dateFormat);
  const endDateFormatted = dayjs(endDate).format(dateFormat);

  const { workbook, sheet } = await createXlsFile();

  let filterGiven = false;
  let totalTeamMemberIds;
  let totalMembers;

  if (userIds || branchIds || departmentIds) {
    filterGiven = true;
  }

  if (filterGiven) {
    totalTeamMemberIds = await generateCommonUserIds(
      subdomain,
      userIds,
      branchIds,
      departmentIds,
    );

    totalMembers = await findTeamMembers(subdomain, totalTeamMemberIds);
  } else {
    // return supervisod users including current user
    if (isCurrentUserAdmin) {
      // return all team member ids
      totalTeamMemberIds = await findTimeclockTeamMemberIds(
        models,
        startDate,
        endDate,
      );
      totalMembers = await findTeamMembers(subdomain, totalTeamMemberIds);
    } else {
      // return supervisod users including current user
      totalMembers = await returnSupervisedUsers(currentUser, subdomain);
      totalTeamMemberIds = totalMembers.map((usr) => usr._id);
    }
  }

  const teamMembersObject: ITeamMembersObj =
    await createTeamMembersObjectWithFullName(subdomain, totalTeamMemberIds);

  const report = await timeclockReportByUsers(
    paginateArray(totalTeamMemberIds, perPage, page),
    models,
    { startDate, endDate },
  );

  const totalColumnsNum = await prepareHeader(sheet, startDate, endDate);

  await extractAndAddIntoSheet(
    models,
    sheet,
    report,
    teamMembersObject,
    totalColumnsNum,
  );

  return {
    name: `Timeclock-${startDateFormatted}-${endDateFormatted}`,
    response: await generateXlsx(workbook),
  };
};
