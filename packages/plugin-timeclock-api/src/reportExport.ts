import * as dayjs from 'dayjs';
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
import { IUsersReport } from './models/definitions/timeclock';
import {
  createTeamMembersObject,
  findTeamMember,
  findTeamMembers,
  generateCommonUserIds,
  returnDepartmentsBranchesDict,
  returnSupervisedUsers
} from './utils';
import { IUserDocument } from '@erxes/api-utils/src/types';

type Structure = {
  departmentIds: string[];
  branchIds: string[];
};

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

const getNextChar = (char, num: number) => {
  return String.fromCharCode(char.charCodeAt(0) + num);
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
      sheet.column('N').width(20);
      sheet.column('O').width(20);
      sheet.column('P').width(20);
    }
    if (reportType === 'Pivot') {
      sheet.column('E').width(50);
      sheet.column('C').width(15);
      sheet.column('D').width(15);
      sheet.column('F').width(15);
      sheet.column('J').width(15);
      sheet.column('M').width(15);
      sheet.column('A').style({ horizontalAlignment: 'left' });
    }
  }

  r.value(values);
};

const prepareHeader = async (
  sheet: any,
  reportType: string,
  showDepartment?: boolean,
  showBranch?: boolean
) => {
  let total_columns = 0;

  switch (reportType) {
    case 'Урьдчилсан' || 'Preliminary':
      const pre_headers = PRELIMINARY_REPORT_COLUMNS;
      // A to I
      addIntoSheet([pre_headers], 'A1', 'I1', sheet, reportType);
      break;
    case 'Сүүлд' || 'Final':
      const final_headers = [...FINAL_REPORT_COLUMNS];
      let column_start = 'A';
      let column_end = 'A';

      if (showBranch || showDepartment) {
        const structure: string[] = [];

        if (showDepartment) {
          structure.push('Цех, тасаг, багийн нэр');
        }
        if (showBranch) {
          structure.push('Салбар нэгж');
        }
        final_headers.unshift([['Structure'], ['№', ...structure]]);
      } else {
        final_headers.unshift([[''], ['№']]);
      }

      for (const header of final_headers) {
        column_end = getNextChar(column_start, header[1].length - 1);
        addIntoSheet(
          [header[0]],
          `${column_start}1`,
          `${column_end}1`,
          sheet,
          reportType,
          true
        );
        addIntoSheet(
          [header[1]],
          `${column_start}2`,
          `${column_end}2`,
          sheet,
          reportType
        );
        column_start = getNextChar(column_end, 1);

        total_columns += header[1].length;
      }

      break;

    case 'Pivot':
      const pivot_headers = PIVOT_REPORT_COLUMNS;

      addIntoSheet([pivot_headers[0][0]], 'A1', 'E1', sheet, reportType, true);
      addIntoSheet([pivot_headers[0][1]], 'A2', 'E2', sheet, reportType);

      addIntoSheet([pivot_headers[1][0]], 'F1', 'F1', sheet, reportType, true);
      addIntoSheet([pivot_headers[1][1]], 'F2', 'F2', sheet, reportType);

      addIntoSheet([pivot_headers[2][0]], 'G1', 'J1', sheet, reportType, true);
      addIntoSheet([pivot_headers[2][1]], 'G2', 'J2', sheet, reportType);

      addIntoSheet([pivot_headers[3][0]], 'K1', 'S1', sheet, reportType, true);
      addIntoSheet([pivot_headers[3][1]], 'K2', 'S2', sheet, reportType);

      break;
  }

  return total_columns;
};

const extractAndAddIntoSheet = async (
  subdomain: any,
  queryParams: any,
  empReports: IUsersReport,
  teamMemberIds: string[],
  teamMembers: IUserDocument[],
  sheet: any,
  reportType: string,
  total_columns: number
) => {
  const totalBranchIdsOfMembers: string[] = [];
  const totalDeptIdsOfMembers: string[] = [];
  const usersStructure: { [userId: string]: Structure } = {};
  const extractValuesIntoArr: any[][] = [];

  const showBranch = queryParams.showBranch
    ? JSON.parse(queryParams.showBranch)
    : false;

  const showDepartment = queryParams.showDepartment
    ? JSON.parse(queryParams.showDepartment)
    : false;

  // get department, branch titles
  for (const teamMember of teamMembers) {
    if (teamMember.branchIds) {
      totalBranchIdsOfMembers.push(...teamMember.branchIds);
    }

    if (teamMember.departmentIds) {
      totalDeptIdsOfMembers.push(...teamMember.departmentIds);
    }

    usersStructure[teamMember._id] = {
      branchIds: teamMember.branchIds ? teamMember.branchIds : [],
      departmentIds: teamMember.departmentIds ? teamMember.departmentIds : []
    };
  }

  const structuresDict = await returnDepartmentsBranchesDict(
    subdomain,
    totalBranchIdsOfMembers,
    totalDeptIdsOfMembers
  );

  let rowNum = 1;

  let startRowIdx = 2;

  const endRowIdx = teamMemberIds.length + 2;

  switch (reportType) {
    case 'Урьдчилсан' || 'Preliminary':
      for (const userId of Object.keys(empReports)) {
        const empReport = empReports[userId];
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

      for (const userId of Object.keys(empReports)) {
        if (!usersStructure[userId]) {
          continue;
        }
        const userBranchIds = usersStructure[userId].branchIds;
        const userDepartmentIds = usersStructure[userId].departmentIds;
        const branchTitles: string[] = [];
        const departmentTitles: string[] = [];

        const empReport = empReports[userId];
        const reportRow = [...Object.values(empReport)];

        if (showBranch) {
          for (const userBranchId of userBranchIds) {
            if (structuresDict[userBranchId]) {
              branchTitles.push(structuresDict[userBranchId]);
            }
          }
          reportRow.unshift(branchTitles.join(','));
        }

        if (showDepartment) {
          for (const userDeptId of userDepartmentIds) {
            departmentTitles.push(structuresDict[userDeptId]);
          }

          if (departmentTitles.length) {
            reportRow.unshift(departmentTitles.join(','));
          } else {
            reportRow.unshift('-');
          }
        }

        reportRow.unshift(rowNum - 2);
        extractValuesIntoArr.push(reportRow);
        rowNum += 1;
      }

      const getEndColumn = getNextChar('A', total_columns);

      addIntoSheet(
        extractValuesIntoArr,
        `A${startRowIdx}`,
        `${getEndColumn}${endRowIdx}`,
        sheet,
        reportType
      );

      break;
    case 'Pivot':
      rowNum = 3;
      let userNum = 1;

      for (const userId of Object.keys(empReports)) {
        const empReport = empReports[userId];
        const rowArray: any = [
          userNum,
          empReport.employeeId,
          empReport.firstName,
          empReport.lastName,
          empReport.position
        ];

        addIntoSheet([rowArray], `A${rowNum}`, `E${rowNum}`, sheet, reportType);

        if (empReport.scheduleReport && empReport.scheduleReport.length) {
          empReport.scheduleReport.forEach(scheduleShift => {
            let checkInDevice = '-';
            let checkOutDevice = '-';

            const getDeviceNames =
              scheduleShift.deviceType && scheduleShift.deviceType.split('x');

            if (getDeviceNames) {
              if (getDeviceNames.length === 2) {
                // checkInDevice = getDeviceNames[0];
                // checkOutDevice = getDeviceNames[1];
                if (
                  getDeviceNames[0] &&
                  getDeviceNames[0].includes('faceTerminal')
                ) {
                  checkInDevice = scheduleShift.deviceName || '-';
                }
                if (
                  getDeviceNames[1] &&
                  getDeviceNames[1].includes('faceTerminal')
                ) {
                  checkOutDevice = scheduleShift.deviceName || '-';
                }
              } else {
                checkInDevice = scheduleShift.deviceName || '-';
                checkOutDevice = scheduleShift.deviceName || '-';
              }
            }
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
              empReport.employeeId,
              empReport.lastName,
              empReport.firstName,
              empReport.position,
              scheduleShift.timeclockDate,
              scheduledStart,
              scheduledEnd,
              scheduleShift.scheduledDuration,
              scheduleShift.lunchBreakInHrs,
              shiftStart,
              checkInDevice,
              shiftEnd,
              checkOutDevice,
              scheduleShift.lunchBreakInHrs,
              scheduleShift.totalHoursOvernight,
              scheduleShift.totalHoursOvertime,
              scheduleShift.timeclockDuration,
              scheduleShift.totalMinsLate
            );

            addIntoSheet(
              [shiftInfo],
              `B${rowNum}`,
              `S${rowNum}`,
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
  params: any
) => {
  const reportType = params.reportType;
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

  const { currentUserId } = params;
  const currentUser = await findTeamMember(subdomain, currentUserId);

  const startDate = params.startDate;
  const endDate = params.endDate;

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
      departmentIds
    );

    totalMembers = await findTeamMembers(subdomain, totalTeamMemberIds);
  } else {
    // return supervisod users including current user
    totalMembers = await returnSupervisedUsers(currentUser, subdomain);
    totalTeamMemberIds = totalMembers.map(usr => usr._id);
  }

  const teamMembersObject = await createTeamMembersObject(
    subdomain,
    totalTeamMemberIds
  );

  let report: IUsersReport = {};

  const totalColumnsNum = await prepareHeader(
    sheet,
    reportType,
    params.showDepartment ? JSON.parse(params.showDepartment) : false,
    params.showBranch ? JSON.parse(params.showBranch) : false
  );

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

  await extractAndAddIntoSheet(
    subdomain,
    params,
    report,
    totalTeamMemberIds,
    totalMembers,
    sheet,
    reportType,
    totalColumnsNum
  );

  return {
    name: `${reportType}-${startDateFormatted}-${endDateFormatted}`,
    response: await generateXlsx(workbook)
  };
};
