import * as dayjs from 'dayjs';
import * as xlsxPopulate from 'xlsx-populate';
import { IModels } from './connectionResolver';
import { reportChartGetResult } from './graphql/resolvers/utils';

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
  customStyles?: any
) => {
  let r;

  r = sheet.range(`${startRowIdx}:${endRowIdx}`);

  //   switch (reportType) {
  //     case 'Урьдчилсан' || 'Preliminary':
  //       r = sheet.range(`${startRowIdx}:${endRowIdx}`);
  //       break;
  //     case 'Сүүлд' || 'Final':
  //       r = sheet.range(`${startRowIdx}:${endRowIdx}`);
  //       break;
  //     case 'Pivot':
  //       r = sheet.range(`${startRowIdx}:${endRowIdx}`);
  //       break;
  //   }

  //   r.style('horizontalAlignment', 'center');

  //   if (merged) {
  //     r.style({ horizontalAlignment: 'center', verticalAlignment: 'center' });
  //     r.merged(true);
  //     r.style('bold', true);

  //     if (reportType === 'Сүүлд' || 'Final') {
  //       sheet.column('B').width(30);
  //       sheet.column('C').width(30);
  //       sheet.column('D').width(15);
  //       sheet.column('E').width(30);
  //       sheet.column('F').width(25);
  //       sheet.column('G').width(15);
  //       sheet.column('H').width(15);
  //       sheet.column('K').width(30);

  //       sheet.column('M').width(20);
  //       sheet.column('N').width(15);
  //       sheet.column('P').width(20);
  //       sheet.column('Q').width(20);
  //       sheet.column('R').width(20);
  //       sheet.column('S').width(20);
  //       sheet.column('T').width(20);
  //       sheet.column('U').width(30);
  //       sheet.column('W').width(30);
  //       sheet.column('X').width(30);

  //       sheet.row(1).height(40);

  //       sheet.column('Q').style('numberFormat', '#,##0');
  //       sheet.column('S').style('numberFormat', '#,##0');
  //       sheet.column('T').style('numberFormat', '#,##0');
  //       sheet.column('U').style('numberFormat', '#,##0');
  //     }
  //     if (reportType === 'Pivot') {
  //       sheet.column('E').width(50);
  //       sheet.column('C').width(15);
  //       sheet.column('D').width(15);
  //       sheet.column('F').width(15);
  //       sheet.column('J').width(15);
  //       sheet.column('M').width(15);
  //       sheet.column('A').style({ horizontalAlignment: 'left' });
  //     }
  //   }

  if (customStyles) {
    for (const cStyle of customStyles) {
      r.style(cStyle.style, cStyle.value);
    }
  }

  r.value(values);
};

const prepareHeader = async (sheet: any, title: string) => {
  let total_columns = 0;

  const header = ['Team member', title];

  addIntoSheet([header], 'A1', 'B1', sheet);
};

const extractAndAddIntoSheet = async (
  subdomain: any,
  data: any,
  labels: string[]
) => {
  const extractValuesIntoArr: any[][] = [];

  return extractValuesIntoArr;
};

const toCamelCase = (str: string) => {
  return str.replace(/[-_](.)/g, function(match, group) {
    return group.toUpperCase();
  });
};

export const buildFile = async (
  models: IModels,
  subdomain: string,
  params: any
) => {
  const { workbook, sheet } = await createXlsFile();
  const dataset = await reportChartGetResult(params, subdomain);
  const { title, data, labels } = dataset;

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
    name: `${toCamelCase(title)}`,
    response: await generateXlsx(workbook)
  };
};
