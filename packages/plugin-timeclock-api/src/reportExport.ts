import dayjs = require('dayjs');
import * as xlsxPopulate from 'xlsx-populate';
import { IModels } from './connectionResolver';
import {
  FINAL_REPORT_COLUMNS,
  PIVOT_REPORT_COLUMNS,
  PRELIMINARY_REPORT_COLUMNS
} from './constants';
import {
  timeclockReportFinal,
  timeclockReportPivot,
  timeclockReportPreliminary
} from './graphql/resolvers/utils';
import { IUserReport } from './models/definitions/timeclock';
import { createTeamMembersObject, generateCommonUserIds } from './utils';

const dateFormat = 'YYYY-MM-DD';
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
  reportType: string,
  merged?: boolean
) => {
  let r;
  switch (reportType) {
    case 'Урьдчилсан' || 'Preliminary':
      r = sheet.range(`${startRowIdx}:${endRowIdx}`);
      break;
    case 'Сүүлд' || 'Final':
      r = sheet.range(`${startRowIdx}:${endRowIdx}`);
      break;
    case 'Pivot':
      r = sheet.range(`${startRowIdx}:${endRowIdx}`);
      break;
  }

  if (merged) {
    r.style({ horizontalAlignment: 'center', verticalAlignment: 'center' });
    r.merged(true);
    r.style('bold', true);
    r.style('fill', 'fffe00');
    sheet.row(2).style('bold', true);
    if (reportType === 'Сүүлд' || 'Final') {
      sheet.column('E').width(50);
      sheet.column('C').width(15);
      sheet.column('D').width(15);
      sheet.column('I').width(15);
      sheet.column('J').width(15);
      sheet.column('K').width(15);
    }
    if (reportType === 'Pivot') {
      sheet.column('E').width(50);
      sheet.column('C').width(15);
      sheet.column('D').width(15);
      sheet.column('F').width(15);
      sheet.column('J').width(15);
      sheet.column('M').width(15);
    }
  }

  r.value(values);
};

const prepareHeader = async (sheet: any, reportType: string) => {
  switch (reportType) {
    case 'Урьдчилсан' || 'Preliminary':
      const pre_headers = PRELIMINARY_REPORT_COLUMNS;
      // A to I
      addIntoSheet([pre_headers], 'A1', 'I1', sheet, reportType);
      break;
    case 'Сүүлд' || 'Final':
      const final_headers = FINAL_REPORT_COLUMNS;

      addIntoSheet([final_headers[0][0]], 'A1', 'E1', sheet, reportType, true);
      addIntoSheet([final_headers[0][1]], 'A2', 'E2', sheet, reportType);

      addIntoSheet([final_headers[1][0]], 'F1', 'G1', sheet, reportType, true);
      addIntoSheet([final_headers[1][1]], 'F2', 'G2', sheet, reportType);
      addIntoSheet([final_headers[2][0]], 'H1', 'M1', sheet, reportType, true);
      addIntoSheet([final_headers[2][1]], 'H2', 'M2', sheet, reportType);
      addIntoSheet([final_headers[3][0]], 'N1', 'P1', sheet, reportType, true);
      addIntoSheet([final_headers[3][1]], 'N2', 'P2', sheet, reportType);
      break;

    case 'Pivot':
      const pivot_headers = PIVOT_REPORT_COLUMNS;

      addIntoSheet([pivot_headers[0][0]], 'A1', 'E1', sheet, reportType, true);
      addIntoSheet([pivot_headers[0][1]], 'A2', 'E2', sheet, reportType);

      addIntoSheet([pivot_headers[1][0]], 'F1', 'F1', sheet, reportType, true);
      addIntoSheet([pivot_headers[1][1]], 'F2', 'F2', sheet, reportType);

      addIntoSheet([pivot_headers[2][0]], 'G1', 'I1', sheet, reportType, true);
      addIntoSheet([pivot_headers[2][1]], 'G2', 'I2', sheet, reportType);

      addIntoSheet([pivot_headers[3][0]], 'J1', 'Q1', sheet, reportType, true);
      addIntoSheet([pivot_headers[3][1]], 'J2', 'Q2', sheet, reportType);

      break;
  }
};

const extractAndAddIntoSheet = (
  empReports: IUserReport[],
  teamMemberIds: string[],
  sheet: any,
  reportType: string
) => {
  const extractValuesIntoArr: any[][] = [];

  let rowNum = 1;

  let startRowIdx = 2;

  const endRowIdx = teamMemberIds.length + 1;

  switch (reportType) {
    case 'Урьдчилсан' || 'Preliminary':
      for (const empReport of empReports) {
        extractValuesIntoArr.push([rowNum, ...Object.values(empReport)]);
        rowNum += 1;
      }

      addIntoSheet(
        extractValuesIntoArr,
        `A${startRowIdx}`,
        `I${endRowIdx}`,
        sheet,
        reportType
      );

      break;

    case 'Сүүлд' || 'Final':
      startRowIdx = 3;
      rowNum = 3;
      for (const empReport of empReports) {
        extractValuesIntoArr.push([rowNum - 2, ...Object.values(empReport)]);
        rowNum += 1;
      }

      addIntoSheet(
        extractValuesIntoArr,
        `A${startRowIdx}`,
        `P${endRowIdx}`,
        sheet,
        reportType
      );

      break;
    case 'Pivot':
      rowNum = 3;
      let userNum = 1;

      for (const empReport of empReports) {
        const rowArray: any = [
          userNum,
          empReport.employeeId,
          empReport.firstName,
          empReport.lastName,
          empReport.position
        ];

        addIntoSheet([rowArray], `A${rowNum}`, `E${rowNum}`, sheet, reportType);

        if (empReport.scheduleReport.length) {
          empReport.scheduleReport.forEach(scheduleShift => {
            const shiftInfo: any = [];

            const scheduledStart = scheduleShift.scheduledStart
              ?.toTimeString()
              .split(' ')[0];
            const scheduledEnd = scheduleShift.scheduledEnd
              ?.toTimeString()
              .split(' ')[0];

            const shiftStart = scheduleShift.timeclockStart
              ?.toTimeString()
              .split(' ')[0];
            const shiftEnd = scheduleShift.timeclockEnd
              ?.toTimeString()
              .split(' ')[0];

            shiftInfo.push(
              scheduleShift.timeclockDate,
              scheduledStart,
              scheduledEnd,
              scheduleShift.scheduledDuration,
              scheduleShift.deviceType,
              shiftStart,
              shiftEnd,
              scheduleShift.deviceName,
              scheduleShift.timeclockDuration,
              scheduleShift.totalHoursOvertime,
              scheduleShift.totalHoursOvernight,
              scheduleShift.totalMinsLate
            );

            addIntoSheet(
              [shiftInfo],
              `F${rowNum}`,
              `Q${rowNum}`,
              sheet,
              reportType
            );
            rowNum += 1;
          });

          rowNum -= 1;
        }

        userNum += 1;
        rowNum += 1;
      }
      break;
  }

  return extractValuesIntoArr;
};

export const buildFile = async (
  models: IModels,
  subdomain: string,
  query: any
) => {
  const reportType = query.reportType;
  const userIds =
    query.userIds instanceof Array || !query.userIds
      ? query.userIds
      : [query.userIds];

  const branchIds =
    query.branchIds instanceof Array || !query.branchIds
      ? query.branchIds
      : [query.branchIds];
  const departmentIds =
    query.departmentIds instanceof Array || !query.departmentIds
      ? query.departmentIds
      : [query.departmentIds];

  const startDate = query.startDate;
  const endDate = query.endDate;

  const startDateFormatted = dayjs(startDate).format(dateFormat);
  const endDateFormatted = dayjs(endDate).format(dateFormat);

  const { workbook, sheet } = await createXlsFile();

  const teamMembersObject = await createTeamMembersObject(subdomain);

  const teamMemberIds = Object.keys(teamMembersObject);

  const teamMemberIdsFromFilter = await generateCommonUserIds(
    subdomain,
    userIds,
    branchIds,
    departmentIds
  );

  const totalTeamMemberIds = teamMemberIdsFromFilter.length
    ? teamMemberIdsFromFilter
    : teamMemberIds;

  let report;

  prepareHeader(sheet, reportType);

  switch (reportType) {
    case 'Урьдчилсан' || 'Preliminary':
      report = await timeclockReportPreliminary(
        subdomain,
        totalTeamMemberIds,
        startDate,
        endDate,
        teamMembersObject,
        true
      );
      break;

    case 'Сүүлд' || 'Final':
      report = await timeclockReportFinal(
        subdomain,
        totalTeamMemberIds,
        startDate,
        endDate,
        teamMembersObject,
        true
      );
      break;
    case 'Pivot':
      report = await timeclockReportPivot(
        subdomain,
        totalTeamMemberIds,
        startDate,
        endDate,
        teamMembersObject,
        true
      );
      delete report.scheduleReport;
      break;
  }

  extractAndAddIntoSheet(
    Object.values(report),
    teamMemberIds,
    sheet,
    reportType
  );

  return {
    name: `${reportType}-${startDateFormatted}-${endDateFormatted}`,
    response: await generateXlsx(workbook)
  };
};
