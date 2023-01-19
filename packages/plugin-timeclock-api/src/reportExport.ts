import { IColumnLabel } from '@erxes/api-utils/src';
import * as moment from 'moment';
import * as xlsxPopulate from 'xlsx-populate';
import { IModels } from './connectionResolver';
import { PRELIMINARY_REPORT_COLUMNS } from './constants';
import { findBranches, timeclockReportByUser } from './graphql/resolvers/utils';
import { findAllTeamMembersWithEmpId, generateCommonUserIds } from './utils';
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

  const { workbook, sheet } = await createXlsFile();

  const addRow = async (values: string[][], rowIndex: number) => {
    const r = sheet.range(`A${rowIndex}:I${rowIndex}`);
    r.value(values);
  };

  const table_headers = PRELIMINARY_REPORT_COLUMNS;
  const teamMembersWithEmpId = await findAllTeamMembersWithEmpId(subdomain);
  const teamMembersObject = {};
  const teamEmployeeIds: string[] = [];

  for (const teamMember of teamMembersWithEmpId) {
    if (!teamMember.employeeId) {
      continue;
    }

    teamMembersObject[teamMember._id] = {
      employeeId: teamMember.employeeId,
      firstName: teamMember.details.firstName,
      lastName: teamMember.details.lastName,
      postion: teamMember.details.postion
    };
    teamEmployeeIds.push(teamMember._id);
  }
  const teamMemberIdsFromFilter = await generateCommonUserIds(
    subdomain,
    userIds,
    branchIds,
    departmentIds
  );

  const totalTeamMemberIds = teamMemberIdsFromFilter.length
    ? teamMemberIdsFromFilter
    : teamEmployeeIds;

  addRow([table_headers], 1);

  let rowIdx = 2;

  const addUserInfoToRow = async (teamMemberId: string) => {
    const userReport = await timeclockReportByUser(
      teamMemberId,
      subdomain,
      startDate,
      endDate
    );
    const userBranches = await findBranches(subdomain, teamMemberId);

    const memberValues = [
      (rowIdx - 1).toString(),
      teamMembersObject[teamMemberId].employeeId || '',
      teamMembersObject[teamMemberId].lastName || '',
      teamMembersObject[teamMemberId].firstName || '',
      userBranches.length ? userBranches[0].title : '',
      teamMembersObject[teamMemberId].postion || '',
      userReport.totalDaysScheduledThisMonth?.toString() || '',
      userReport.totalDaysWorkedThisMonth?.toString() || ''
    ];

    await addRow([memberValues], rowIdx);
    rowIdx += 1;
  };

  // tslint:disable-next-line:prefer-for-of
  for (const teamMemberId of totalTeamMemberIds) {
    await addUserInfoToRow(teamMemberId);
  }

  return {
    name: `${reportType}-report-${moment().format('YYYY-MM-DD')}`,
    response: await generateXlsx(workbook)
  };
};
