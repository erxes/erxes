import * as dayjs from 'dayjs';
import * as xlsxPopulate from 'xlsx-populate';
import { IModels } from './connectionResolver';
import {
  FINAL_REPORT_COLUMNS,
  PIVOT_REPORT_COLUMNS,
  PRELIMINARY_REPORT_COLUMNS
} from './constants';
import {
  bichilTimeclockReportFinal,
  bichilTimeclockReportPivot,
  bichilTimeclockReportPreliminary
} from './graphql/resolvers/utils';
import { IUsersReport } from './models/definitions/timeclock';
import {
  createTeamMembersObject,
  findAllTeamMembers,
  findBranchUsers,
  findBranches,
  findSubBranches,
  findTeamMember,
  findTeamMembers,
  generateCommonUserIds,
  getNextNthColumnChar,
  paginateArray,
  returnDepartmentsBranchesDict,
  returnSupervisedUsers
} from './utils';
import { IUserDocument } from '@erxes/api-utils/src/types';

type Structure = {
  departmentIds: string[];
  branchIds: string[];
};

const dateFormat = 'YYYY-MM-DD';
const dateFormat2 = 'YYYY.MM.DD';
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
  merged?: boolean,
  customStyles?: any
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

  r.style('horizontalAlignment', 'center');

  if (merged) {
    r.style({ horizontalAlignment: 'center', verticalAlignment: 'center' });
    r.merged(true);
    r.style('bold', true);

    if (reportType === 'Сүүлд' || 'Final') {
      sheet.column('B').width(30);
      sheet.column('C').width(30);
      sheet.column('D').width(15);
      sheet.column('E').width(30);
      sheet.column('F').width(25);
      sheet.column('G').width(15);
      sheet.column('H').width(15);
      sheet.column('K').width(30);

      sheet.column('M').width(20);
      sheet.column('N').width(15);
      sheet.column('P').width(20);
      sheet.column('Q').width(20);
      sheet.column('R').width(20);
      sheet.column('S').width(20);
      sheet.column('T').width(20);
      sheet.column('U').width(30);

      sheet.row(1).height(40);

      sheet.column('Q').style('numberFormat', '#,##0.00');
      sheet.column('S').style('numberFormat', '#,##0.00');
      sheet.column('T').style('numberFormat', '#,##0.00');
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

  if (customStyles) {
    for (const cStyle of customStyles) {
      r.style(cStyle.style, cStyle.value);
    }
  }

  r.value(values);
};

const prepareHeader = async (
  sheet: any,
  reportType: string,
  startDate?: Date,
  endDate?: Date,
  parentColumnsCount?: number
) => {
  let total_columns = 0;

  switch (reportType) {
    case 'Урьдчилсан' || 'Preliminary':
      const pre_headers = PRELIMINARY_REPORT_COLUMNS;
      // A to I
      addIntoSheet([pre_headers], 'A1', 'I1', sheet, reportType);
      break;
    case 'Сүүлд' || 'Final':
      const final_headers = [...FINAL_REPORT_COLUMNS(parentColumnsCount)];

      let column_start = 'A';
      let column_end = 'A';

      for (const header of final_headers) {
        total_columns += header[1].length;
        column_end = getNextNthColumnChar(column_start, header[1].length - 1);

        if (!header[0][0].length) {
          addIntoSheet(
            [header[1]],
            `${column_start}3`,
            `${column_end}4`,
            sheet,
            reportType,
            true
          );
          column_start = getNextNthColumnChar(column_end, 1);
          continue;
        }

        addIntoSheet(
          [header[0]],
          `${column_start}3`,
          `${column_end}3`,
          sheet,
          reportType,
          true
        );
        addIntoSheet(
          [header[1]],
          `${column_start}4`,
          `${column_end}4`,
          sheet,
          reportType
        );
        column_start = getNextNthColumnChar(column_end, 1);
      }

      addIntoSheet(
        `${dayjs(startDate).format(dateFormat2)} - ${dayjs(endDate).format(
          dateFormat2
        )}`,
        'A2',
        `${column_end}2`,
        sheet,
        reportType,
        true
      );

      break;

    case 'Pivot':
      const pivot_headers = PIVOT_REPORT_COLUMNS;

      addIntoSheet([pivot_headers[0][0]], 'A1', 'D1', sheet, reportType, true);
      addIntoSheet([pivot_headers[0][1]], 'A2', 'D2', sheet, reportType);

      addIntoSheet([pivot_headers[1][0]], 'E1', 'E1', sheet, reportType, true);
      addIntoSheet([pivot_headers[1][1]], 'E2', 'E2', sheet, reportType);

      addIntoSheet([pivot_headers[2][0]], 'F1', 'I1', sheet, reportType, true);
      addIntoSheet([pivot_headers[2][1]], 'F2', 'I2', sheet, reportType);

      addIntoSheet([pivot_headers[3][0]], 'J1', 'R1', sheet, reportType, true);
      addIntoSheet([pivot_headers[3][1]], 'J2', 'R2', sheet, reportType);

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
  total_columns: number,
  deductionInfo?: any
) => {
  const totalBranchIdsOfMembers: string[] = [];
  const totalDeptIdsOfMembers: string[] = [];
  const usersStructure: { [userId: string]: Structure } = {};
  const extractValuesIntoArr: any[][] = [];

  let total_columns_num = total_columns;

  const { startDate, endDate } = queryParams;

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

  let structuresDict = await returnDepartmentsBranchesDict(
    subdomain,
    Array.from(new Set(totalBranchIdsOfMembers)),
    Array.from(new Set(totalDeptIdsOfMembers))
  );

  let rowNum = 1;

  let startRowIdx = 2;
  let endRowIdx = teamMemberIds.length + 2;

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
      startRowIdx = 5;
      rowNum = 5;

      let startRowIdxPerParentTitle: number = startRowIdx;
      let endRowIdxPerParentTitle: number = startRowIdxPerParentTitle;
      let startRowIdxPerBranch: number = startRowIdx;
      let endRowIdxPerBranch: number = startRowIdxPerBranch;
      let maxParentsCount: number = 0;

      const numeration: number[][] = [];

      const groupedByBranch: { [branchTitle: string]: any } = {};
      const parentBranchesDict: any = {};

      for (const userId of Object.keys(empReports)) {
        if (!usersStructure[userId]) {
          continue;
        }

        const userReport: any[] = Object.values(empReports[userId]);
        const userBranchIds = usersStructure[userId].branchIds;
        const userBranchTitleToIdDict: { [branchTitle: string]: string } = {};

        const userBranchTitles: any[] = userBranchIds.map(branchId => {
          if (structuresDict[branchId]) {
            userBranchTitleToIdDict[structuresDict[branchId].title] = branchId;
            return structuresDict[branchId].title;
          }
        });

        for (const userBranchTitle of userBranchTitles) {
          if (userBranchTitle in groupedByBranch) {
            groupedByBranch[userBranchTitle].report = [
              ...groupedByBranch[userBranchTitle].report,
              userReport
            ];
            continue;
          }

          const branchId = userBranchTitleToIdDict[userBranchTitle];

          const parentsCount = structuresDict[branchId].parentsCount || 0;

          maxParentsCount =
            parentsCount > maxParentsCount ? parentsCount : maxParentsCount;

          groupedByBranch[userBranchTitle] = {
            parentsCount,
            parentsTitles: structuresDict[branchId].parentsTitles || [],
            groupTitle: userBranchTitle,
            report: [userReport]
          };
        }
      }

      total_columns_num = await prepareHeader(
        sheet,
        reportType,
        startDate,
        endDate,
        maxParentsCount
      );

      for (const branchTitle of Object.keys(groupedByBranch)) {
        const bichilReport = groupedByBranch[branchTitle];

        const { parentsTitles, parentsCount } = bichilReport;

        for (const parentTitle of parentsTitles) {
          if (parentBranchesDict[parentTitle]) {
            parentBranchesDict[parentTitle] = [
              ...parentBranchesDict[parentTitle],
              bichilReport
            ];
            continue;
          }

          parentBranchesDict[parentTitle] = [bichilReport];
        }
      }

      const hasParentBranches = Object.keys(parentBranchesDict).length;

      const branchTitleColumn = getNextNthColumnChar(
        'B',
        hasParentBranches ? 1 : 0
      );

      const userReportStartColumn = getNextNthColumnChar(branchTitleColumn, 1);

      const userReportEndColumn = getNextNthColumnChar(
        userReportStartColumn,
        total_columns_num
      );

      if (hasParentBranches) {
        for (const parentBranchTitle of Object.keys(parentBranchesDict)) {
          const groupReports = parentBranchesDict[parentBranchTitle];

          const totalRowsPerParent = groupReports.reduce(
            (sum, userReport) => sum + userReport.report.length || 0,
            0
          );

          endRowIdxPerParentTitle =
            startRowIdxPerParentTitle + totalRowsPerParent - 1;

          addIntoSheet(
            [[parentBranchTitle]],
            `B${startRowIdxPerParentTitle}`,
            `B${endRowIdxPerParentTitle}`,
            sheet,
            reportType,
            true
          );

          startRowIdxPerParentTitle = endRowIdxPerParentTitle + 1;

          for (const groupReport of groupReports) {
            const { groupTitle } = groupReport;

            const getTotalUsersLengthPerBranch = groupReport.report.length - 1;

            endRowIdxPerBranch =
              startRowIdxPerBranch + getTotalUsersLengthPerBranch;

            endRowIdx = endRowIdxPerBranch;

            addIntoSheet(
              [[groupTitle]],
              `${branchTitleColumn}${startRowIdxPerBranch}`,
              `${branchTitleColumn}${endRowIdxPerBranch}`,
              sheet,
              reportType,
              true,
              [{ style: 'bold', value: false }]
            );
            addIntoSheet(
              groupReport.report,
              `${userReportStartColumn}${startRowIdxPerBranch}`,
              `${userReportEndColumn}${endRowIdxPerBranch}`,
              sheet,
              reportType
            );

            startRowIdxPerBranch = endRowIdxPerBranch + 1;
          }
        }
      }
      // no parent branches
      else {
        for (const branchTitle of Object.keys(groupedByBranch)) {
          const getTotalUsersLengthPerBranch =
            groupedByBranch[branchTitle].report.length - 1;
          endRowIdxPerBranch =
            startRowIdxPerBranch + getTotalUsersLengthPerBranch;
          endRowIdx = endRowIdxPerBranch;
          addIntoSheet(
            [[branchTitle]],
            `${branchTitleColumn}${startRowIdxPerBranch}`,
            `${branchTitleColumn}${endRowIdxPerBranch}`,
            sheet,
            reportType,
            true,
            [{ style: 'bold', value: false }]
          );
          addIntoSheet(
            groupedByBranch[branchTitle].report,
            `${userReportStartColumn}${startRowIdxPerBranch}`,
            `${userReportEndColumn}${endRowIdxPerBranch}`,
            sheet,
            reportType
          );
          startRowIdxPerBranch = endRowIdxPerBranch + 1;
        }
      }

      for (let num = 1; num < endRowIdx - 3; num++) {
        numeration.push([num]);
      }

      // add numeration
      addIntoSheet(
        numeration,
        `A${startRowIdx}`,
        `A${endRowIdx}`,
        sheet,
        reportType,
        false,
        [{ style: 'horizontalAlignment', value: 'center' }]
      );

      endRowIdx++;

      const getStartColumn = hasParentBranches ? 'G' : 'F';

      addIntoSheet(
        deductionInfo.totalHoursScheduled,
        `${getStartColumn}${endRowIdx}`,
        `${getStartColumn}${endRowIdx}`,
        sheet,
        reportType,
        false,
        [{ style: 'bold', value: true }]
      );

      addIntoSheet(
        deductionInfo.totalHoursWorked,
        `${getNextNthColumnChar(getStartColumn, 1)}${endRowIdx}`,
        `${getNextNthColumnChar(getStartColumn, 1)}${endRowIdx}`,
        sheet,
        reportType,
        false,
        [{ style: 'bold', value: true }]
      );

      addIntoSheet(
        deductionInfo.totalShiftNotClosedDeduction,
        `${getNextNthColumnChar(getStartColumn, 10)}${endRowIdx}`,
        `${getNextNthColumnChar(getStartColumn, 10)}${endRowIdx}`,
        sheet,
        reportType,
        false,
        [{ style: 'bold', value: true }]
      );

      addIntoSheet(
        deductionInfo.totalLateMinsDeduction,
        `${getNextNthColumnChar(getStartColumn, 13)}${endRowIdx}`,
        `${getNextNthColumnChar(getStartColumn, 13)}${endRowIdx}`,
        sheet,
        reportType,
        false,
        [{ style: 'bold', value: true }]
      );

      addIntoSheet(
        deductionInfo.totalAbsentDeduction,
        `${getNextNthColumnChar(getStartColumn, 16)}${endRowIdx}`,
        `${getNextNthColumnChar(getStartColumn, 16)}${endRowIdx}`,
        sheet,
        reportType,
        false,
        [{ style: 'bold', value: true }]
      );

      addIntoSheet(
        deductionInfo.totalDeductionPerGroup,
        `${getNextNthColumnChar(getStartColumn, 17)}${endRowIdx}`,
        `${getNextNthColumnChar(getStartColumn, 17)}${endRowIdx}`,
        sheet,
        reportType,
        false,
        [{ style: 'bold', value: true }]
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
          empReport.fullName,
          empReport.position
        ];

        addIntoSheet([rowArray], `A${rowNum}`, `D${rowNum}`, sheet, reportType);

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
              scheduleShift.timeclockDate,
              scheduledStart || '-',
              scheduledEnd || '-',
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
              `E${rowNum}`,
              `R${rowNum}`,
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
  const isCurrentUserAdmin = params.isCurrentUserAdmin;

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

  const { currentUserId, page = 1, perPage = 20 } = params;

  const currentUser = await findTeamMember(subdomain, currentUserId);

  const startDate = params.startDate;
  const endDate = params.endDate;

  const startDateFormatted = dayjs(startDate).format(dateFormat);
  const endDateFormatted = dayjs(endDate).format(dateFormat);

  const { workbook, sheet } = await createXlsFile();

  let filterGiven = false;
  let totalTeamMemberIds;
  let totalTeamMembers;

  const branchIdsGivenOnly = !departmentIds && !userIds && branchIds;

  if (userIds || branchIds || departmentIds) {
    filterGiven = true;
  }

  const branchesReportStructure: {
    [branchTitle: string]: IUserDocument[];
  } = {};

  const parentBranchesDict: { [branchId: string]: string } = {};

  if (branchIdsGivenOnly) {
    const totalUsers: IUserDocument[] = [];
    const totalUserIds: string[] = [];

    const getParentBranches = await findBranches(subdomain, branchIds);

    for (const branchId of branchIds) {
      const getSubBranches = await findSubBranches(subdomain, branchId);
      const subBranchIds = getSubBranches.map(b => b._id);

      const totalBranchIds = [branchId, ...subBranchIds];
      const branchUsers = await findBranchUsers(subdomain, totalBranchIds);
      const parentBranch = getParentBranches.filter(p => p._id === branchId);

      for (const subBranchId of subBranchIds) {
        parentBranchesDict[subBranchId] = parentBranch[0].title;
      }

      branchesReportStructure[parentBranch.title] = branchUsers.map(b => b._id);

      totalUserIds.push(...branchUsers.map(u => u._id));
      totalUsers.push(...branchUsers);
    }

    totalTeamMembers = totalUsers;
    totalTeamMemberIds = totalUserIds;
  } else {
    if (filterGiven) {
      totalTeamMemberIds = await generateCommonUserIds(
        subdomain,
        userIds,
        branchIds,
        departmentIds
      );

      totalTeamMembers = await findTeamMembers(subdomain, totalTeamMemberIds);
    } else {
      // return supervisod users including current user
      if (isCurrentUserAdmin) {
        // return all team member ids
        totalTeamMembers = await findAllTeamMembers(subdomain);
        totalTeamMemberIds = totalTeamMembers.map(usr => usr._id);
      } else {
        // return supervisod users including current user
        totalTeamMembers = await returnSupervisedUsers(currentUser, subdomain);
        totalTeamMemberIds = totalTeamMembers.map(usr => usr._id);
      }
    }
  }

  const teamMembersObject = await createTeamMembersObject(
    subdomain,
    totalTeamMemberIds
  );

  let report: IUsersReport = {};
  let deductionInfo = {};
  let totalColumnsNum;

  if (!(reportType == 'Сүүлд' || reportType === 'Final')) {
    totalColumnsNum = await prepareHeader(
      sheet,
      reportType,
      startDate,
      endDate
    );
  }

  const paginatedTeamMemberIds = paginateArray(
    totalTeamMemberIds,
    perPage,
    page
  );

  const getCorrectTeamMemberIds =
    totalTeamMemberIds.length > 20
      ? paginatedTeamMemberIds
      : totalTeamMemberIds;

  const getCorrectTeamMembers =
    totalTeamMembers.length > 20
      ? paginateArray(totalTeamMembers, perPage, page)
      : totalTeamMembers;

  switch (reportType) {
    case 'Урьдчилсан' || 'Preliminary':
      report = await bichilTimeclockReportPreliminary(
        subdomain,
        getCorrectTeamMemberIds,
        startDate,
        endDate,
        teamMembersObject,
        true
      );
      break;

    case 'Сүүлд' || 'Final':
      const reportFinal = await bichilTimeclockReportFinal(
        subdomain,
        getCorrectTeamMemberIds,
        startDate,
        endDate,
        teamMembersObject,
        true
      );

      report = reportFinal?.report || {};
      deductionInfo = reportFinal?.deductionInfo || {};

      break;
    case 'Pivot':
      report = await bichilTimeclockReportPivot(
        subdomain,
        getCorrectTeamMemberIds,
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
    getCorrectTeamMemberIds,
    getCorrectTeamMembers,
    sheet,
    reportType,
    totalColumnsNum,
    deductionInfo
  );

  return {
    name: `${reportType}-${startDateFormatted}-${endDateFormatted}`,
    response: await generateXlsx(workbook)
  };
};
