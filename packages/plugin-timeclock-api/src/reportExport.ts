import * as moment from 'moment';
import * as xlsxPopulate from 'xlsx-populate';
import { IModels } from './connectionResolver';
import { PRELIMINARY_REPORT_COLUMNS } from './constants';
import { timeclockReportPreliminary } from './graphql/resolvers/utils';
import { IUserReport } from './models/definitions/timeclock';
import { createTeamMembersObject, generateCommonUserIds } from './utils';
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

  const addIntoSheet = async (
    values: string[][],
    rowStartIdx: number,
    rowEndIdx: number
  ) => {
    const r = sheet.range(`A${rowStartIdx}:I${rowEndIdx}`);
    r.value(values);
  };

  const table_headers = PRELIMINARY_REPORT_COLUMNS;

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

  addIntoSheet([table_headers], 1, 1);

  const startRowIdx = 2;
  const endRowIdx = teamMemberIds.length + 1;

  const reportPreliminary: any = await timeclockReportPreliminary(
    subdomain,
    totalTeamMemberIds,
    startDate,
    endDate,
    teamMembersObject,
    'xlsx'
  );

  const extractValuesFromEmpReportObjects = (empReports: IUserReport[]) => {
    const extractValuesIntoArr: any[][] = [];
    let rowNum = 1;

    for (const empReport of empReports) {
      extractValuesIntoArr.push([rowNum, ...Object.values(empReport)]);
      rowNum += 1;
    }

    return extractValuesIntoArr;
  };

  const extractAllData = extractValuesFromEmpReportObjects(
    Object.values(reportPreliminary)
  );

  addIntoSheet(extractAllData, startRowIdx, endRowIdx);

  return {
    name: `${reportType}-report-${moment().format('YYYY-MM-DD')}`,
    response: await generateXlsx(workbook)
  };
};
