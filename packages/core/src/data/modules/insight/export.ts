import * as xlsxPopulate from "xlsx-populate";
import { sendCommonMessage } from "../../../messageBroker";

/**
 * Creates blank workbook
 */

const chartGetResult = async (
  { serviceName, templateType, chartType, filter: stringifiedFilter },
  subdomain: any
) => {
  const filter = JSON.parse(stringifiedFilter);

  const chartResult = await sendCommonMessage({
    subdomain,
    serviceName,
    action: "reports.getChartResult",
    data: {
      filter,
      templateType,
      chartType
    },
    isRPC: true
  });

  return chartResult;
};

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

  if (customStyles) {
    for (const cStyle of customStyles) {
      r.style(cStyle.style, cStyle.value);
    }
  }

  r.value(values);
  r.style({ wrapText: true });
};

const prepareHeader = async (
  sheet: any,
  title?: string,
  dimensions?: string[],
  measures?: string[]
) => {
  const headers =
    dimensions && measures ? [...dimensions, ...measures] : [title, "count"];

  for (let i = 0; i < headers.length; i++) {
    const columnLetter = String.fromCharCode(65 + i);
    sheet.column(columnLetter).width(15);
  }

  addIntoSheet(
    [headers],
    "A1",
    `${String.fromCharCode(65 + headers.length - 1)}1`,
    sheet
  );
};

const isArrayPrimitive = arr => {
  for (const element of arr) {
    if (typeof element !== "object" && typeof element !== "function") {
      return true; // If a non-object element is found, return true (primitive type)
    }
  }
  return false; // If no non-object element is found, return false (array of objects)
};

const extractAndAddIntoSheet = async (
  sheet: any,
  data: any,
  labels?: string[],
  dimensions?: string[],
  measures?: string[]
) => {
  let headers: string[] = [];

  if (labels?.length) {
    headers = labels;
  } else if (dimensions && measures) {
    headers = [...dimensions, ...measures];
  }

  const extractValuesIntoArr: any[][] = [];

  const startRowIdx = 2;
  const endRowIdx = startRowIdx + data?.length;

  if (labels?.length) {
    if (isArrayPrimitive(data)) {
      extractValuesIntoArr.push(...labels.map((label, i) => [label, data[i]]));
    }
  } else if (data?.length) {
    data.forEach(item => {
      const extractedValues = headers.map(key => item[key]);
      extractValuesIntoArr.push(extractedValues);
    });
  }

  const dataRange = sheet.range(`A${startRowIdx - 1}:${String.fromCharCode(65 + headers.length - 1)}${endRowIdx - 1}`);
  dataRange.style({ border: "thin" });

  addIntoSheet(
    extractValuesIntoArr,
    `A${startRowIdx}`,
    `${String.fromCharCode(65 + headers.length - 1)}${endRowIdx}`,
    sheet
  );
};
const toCamelCase = (str: string) => {
  return str.replace(/[-_](.)/g, function (match, group) {
    return group.toUpperCase();
  });
};

export const buildChartFile = async (subdomain: string, params: any) => {
  const { workbook, sheet } = await createXlsFile();
  const dataset = await chartGetResult(params, subdomain);

  const { dimension, measure, colDimension, rowDimension } = JSON.parse(params.filter);
  const { title, data, labels } = dataset;

  let dimensions

  if (colDimension?.length || rowDimension?.length) {
    dimensions = [...colDimension.map(col => col.value), ...rowDimension.map(row => row.value)]
  } else {
    dimensions = Array.isArray(dimension) ? dimension : dimension?.split(",") || []
  }

  await prepareHeader(sheet, title, dimensions, measure);
  await extractAndAddIntoSheet(sheet, data, labels, dimensions, measure);

  return {
    name: `${toCamelCase(title)}`,
    response: await generateXlsx(workbook)
  };
};
