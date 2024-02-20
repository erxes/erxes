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
  customStyles?: any,
) => {
  let r;

  r = sheet.range(`${startRowIdx}:${endRowIdx}`);

  if (customStyles) {
    for (const cStyle of customStyles) {
      r.style(cStyle.style, cStyle.value);
    }
  }

  r.value(values);
};

const prepareHeader = async (sheet: any, title: string) => {
  const header = ['Team member', title];

  sheet.column('A').width(40);

  addIntoSheet([header], 'A1', 'B1', sheet);
};

const isArrayPrimitive = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'object' && typeof arr[i] !== 'function') {
      return true; // If a non-object element is found, return true (primitive type)
    }
  }
  return false; // If no non-object element is found, return false (array of objects)
};

const extractAndAddIntoSheet = async (
  sheet: any,
  data: any,
  labels: string[],
) => {
  const extractValuesIntoArr: any[][] = [];
  const startRowIdx = 2;
  const endRowIdx = 2 + data.length;

  if (isArrayPrimitive(data)) {
    for (let i = 0; i < data.length; i++) {
      extractValuesIntoArr.push([labels[i], data[i]]);
    }
  }

  addIntoSheet(extractValuesIntoArr, `A${startRowIdx}`, `B${endRowIdx}`, sheet);
};

const toCamelCase = (str: string) => {
  return str.replace(/[-_](.)/g, function (match, group) {
    return group.toUpperCase();
  });
};

export const buildFile = async (subdomain: string, params: any) => {
  const { workbook, sheet } = await createXlsFile();
  const dataset = await reportChartGetResult(params, subdomain);
  const { title, data, labels } = dataset;

  await prepareHeader(sheet, title);
  await extractAndAddIntoSheet(sheet, data, labels);

  return {
    name: `${toCamelCase(title)}`,
    response: await generateXlsx(workbook),
  };
};
