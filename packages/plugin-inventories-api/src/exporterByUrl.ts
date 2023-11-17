import * as xlsxPopulate from 'xlsx-populate';
import { paginate } from '@erxes/api-utils/src/core';
import * as moment from 'moment';
import { IColumnLabel } from '@erxes/api-utils/src/types';
import { generateModels, IModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateFilterItems } from './graphql/resolvers/queries/safeRemainderItems';
import { sendFormsMessage, sendProductsMessage } from './messageBroker';

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

export const fillHeaders = (itemType: string): IColumnLabel[] => {
  let columnNames: IColumnLabel[] = [];
  return columnNames;
};

const generateLabel = customer => {
  const { firstName, primaryEmail, primaryPhone, lastName } =
    customer || ({} as any);

  let value = firstName ? firstName.toUpperCase() : '';

  if (lastName) {
    value = `${value} ${lastName}`;
  }
  if (primaryPhone) {
    value = `${value} (${primaryPhone})`;
  }
  if (primaryEmail) {
    value = `${value} /${primaryEmail}/`;
  }

  return value;
};

const getCellValue = (item, colName, product, customField = '') => {
  switch (colName) {
    case 'barcode':
      return (product.barcodes || []).join(', ');
    case 'oldCode':
      return (
        (
          (product.customFieldsData || []).find(
            cfd => cfd.field === customField
          ) || {}
        ).value || ''
      );
    case 'code':
      return product.code;
    case 'count':
      return item.count;
    case 'location':
      return;
    default:
      return;
  }
};
/**
 * Finds given field of database collection row and format it in a human-friendly way.
 * @param {string} colName Database field name
 * @param {any} item Database row
 * @todo If same field names from different collections arrive, then this function will
 * not find the from the proper collection. As for now, those field names are defined
 * in distinctly defined static variables.
 */
export const fillCellValue = async (
  colName: string,
  item: any,
  product: any,
  customField: string
): Promise<string> => {
  const emptyMsg = '-';
  if (colName.includes('empty')) {
    return '';
  }

  if (!item) {
    return emptyMsg;
  }

  let cellValue: any = getCellValue(item, colName, product, customField);

  return cellValue || emptyMsg;
};

const generateParams = ({ queryParams }) => ({
  page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
  perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20,
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? parseInt(queryParams.sortDirection, 10)
    : undefined,

  remainderId: queryParams.remainderId,
  productCategoryIds:
    queryParams.productCategoryIds && queryParams.productCategoryIds.split(','),
  status: queryParams.status,
  diffType: queryParams.diffType
});

// Prepares data depending on module type
const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const params = generateParams({ queryParams: query });
  const perPage = params.perPage;

  const selector: any = await generateFilterItems(subdomain, params);
  const count = await models.SafeRemainderItems.find(selector).count();

  let datas = [];
  const pageCount = Math.ceil(count / perPage);

  for (let page = 1; page <= pageCount; page++) {
    const orders = await paginate(
      models.SafeRemainderItems.find(query)
        .sort({ order: 1 })
        .lean(),
      { ...params, page }
    );
    datas = datas.concat(orders);
  }
  return datas;
};

const addCell = (
  col: IColumnLabel,
  value: string,
  sheet: any,
  columnNames: string[],
  rowIndex: number
): void => {
  let fixedValue = value;

  if (Array.isArray(fixedValue)) {
    fixedValue = '';
  }

  // Checking if existing column
  if (columnNames.includes(col.name)) {
    // If column already exists adding cell
    sheet.cell(rowIndex, columnNames.indexOf(col.name) + 1).value(fixedValue);
  } else {
    // Creating column
    sheet.cell(1, columnNames.length + 1).value(col.label || col.name);
    // Creating cell
    sheet.cell(rowIndex, columnNames.length + 1).value(fixedValue);

    columnNames.push(col.name);
  }
};

const headers = [
  { name: 'barcode', label: 'barcode' },
  { name: 'oldCode', label: 'old Code' },
  { name: 'code', label: 'code' },
  { name: 'empty2', label: 'col2' },
  { name: 'empty3', label: 'col3' },
  { name: 'count', label: 'Count' },
  { name: 'empty4', label: 'col4' },
  { name: 'empty5', label: 'col5' },
  { name: 'location', label: 'Location' },
  { name: 'empty6', label: 'col6' },
  { name: 'empty7', label: 'col7' }
];

export const buildFile = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<{ name: string; response: string }> => {
  const data = await prepareData(models, subdomain, query);

  // Reads default template
  const { workbook, sheet } = await createXlsFile();

  const columnNames: string[] = headers.map(h => h.name);
  let rowIndex: number = 1;

  for (const column of headers) {
    addCell(column, column.label, sheet, columnNames, rowIndex);
  }

  const limit = await sendProductsMessage({
    subdomain,
    action: 'count',
    data: { query: { _id: { $in: data.map(d => d.productId) } } },
    isRPC: true
  });
  const products = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: { query: { _id: { $in: data.map(d => d.productId) } }, limit },
    isRPC: true
  });
  const customField =
    (await sendFormsMessage({
      subdomain,
      action: 'fields.findOne',
      data: { query: { code: 'oldCode' } },
      isRPC: true,
      defaultValue: {}
    })) || {};

  const productById = {};
  for (const product of products) {
    productById[product._id] = product;
  }

  for (const item of data) {
    rowIndex++;
    const product = productById[item.productId];
    // Iterating through basic info columns
    for (const column of headers) {
      const cellValue = await fillCellValue(
        column.name,
        item,
        product,
        customField._id
      );

      addCell(column, cellValue, sheet, columnNames, rowIndex);
    }
  } // end items for loop

  return {
    name: `censusJ - ${moment().format('YYYY-MM-DD HH:mm')}`,
    response: await generateXlsx(workbook)
  };
};

export const exportCensusRunner = async (req, res) => {
  const { query } = req;
  const subdomain = getSubdomain(req);

  const models = await generateModels(subdomain);

  const result = await buildFile(models, subdomain, query);

  res.attachment(`${result.name}.xlsx`);

  return res.send(result.response);
};
