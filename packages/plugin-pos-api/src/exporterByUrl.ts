import * as xlsxPopulate from 'xlsx-populate';
import * as moment from 'moment';
import { IColumnLabel } from '@erxes/api-utils/src/types';
import { generateModels, IModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import {
  posOrderRecordsCountQuery,
  posOrderRecordsQuery
} from './graphql/resolvers/queries/orders';

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

const getCellValue = (order, colName) => {
  switch (colName) {
    case 'created_date':
      return moment(order.paidDate || order.createdAt).format('YYYY-MM-DD');
    case 'created_time':
      return moment(order.paidDate || order.createdAt).format('HH:mm:ss');
    case 'number':
      return order.number;
    case 'pos':
      return `${order.posName || ''}${order.origin === 'kiosk' ? '*' : ''}`;
    case 'branch':
      return `${order.branch?.code || ''} - ${order.branch?.title || ''}` || '';
    case 'department':
      return (
        `${order.department?.code || ''} - ${order.department?.title || ''}` ||
        ''
      );
    case 'cashier':
      return order.user ? order.user.email : '';
    case 'type':
      return order.type || '';
    case 'billType':
      return order.billType || '';
    case 'companyRD':
      return order.registerNumber || '';
    case 'customerType':
      return order.customerType || '';
    case 'customer':
      return generateLabel(order.customer) || '';
    case 'barcode':
      return order.items?.product?.barcodes?.[0] || '';
    case 'subBarcode':
      return (
        (order.items?.manufactured
          ? moment(order.items?.manufactured).format('YYYY-MM-DD HH:mm')
          : '') || ''
      );
    case 'code':
      return order.items?.product?.code || '';
    case 'categoryCode':
      return order.items?.productCategory?.code || '';
    case 'categoryName':
      return order.items?.productCategory?.name || '';
    case 'name':
      return order.items?.product?.name || '';
    case 'count':
      return order.items?.count || 0;
    case 'firstPrice':
      return (
        ((order.items?.count || 0) * (order.items?.unitPrice || 0) +
          (order.items?.discountAmount || 0)) /
        (order.items?.count || 1)
      );
    case 'discount':
      return order.items?.discountAmount || 0;
    case 'discountType':
      return order.items?.discountType || '';
    case 'salePrice':
      return order.items?.unitPrice || 0;
    case 'amount':
      return (order.items?.count || 0) * (order.items?.unitPrice || 0);
    case 'payType':
      return [
        ...Array.from(
          new Set(
            [
              ...order.paidAmounts,
              { type: 'cash', amount: order.cashAmount },
              { type: 'mobile', amount: order.mobileAmount }
            ]
              .filter(pa => pa.amount > 0)
              .map(pa => pa.type)
          )
        )
      ].join(', ');
  }

  return '';
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
  item: any
): Promise<string> => {
  const emptyMsg = '-';

  if (!item) {
    return emptyMsg;
  }

  let cellValue: any = getCellValue(item, colName);

  if (typeof item[colName] === 'boolean') {
    cellValue = item[colName] ? 'Yes' : 'No';
  }

  switch (colName) {
    case 'emails':
      cellValue = (item.emails || []).join(', ');
      break;
    case 'phones':
      cellValue = (item.phones || []).join(', ');
      break;
    case 'names':
      cellValue = (item.names || []).join(', ');

      break;

    default:
      break;
  }

  return cellValue || emptyMsg;
};

const generateParams = ({ queryParams }) => ({
  page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
  perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20,
  sortField: queryParams.sortField,
  sortDirection: queryParams.sortDirection
    ? parseInt(queryParams.sortDirection, 10)
    : undefined,
  search: queryParams.search,
  paidStartDate: queryParams.paidStartDate
    ? new Date(queryParams.paidStartDate)
    : undefined,
  paidEndDate: queryParams.paidEndDate
    ? new Date(queryParams.paidEndDate)
    : undefined,
  createdStartDate: queryParams.createdStartDate
    ? new Date(queryParams.createdStartDate)
    : undefined,
  createdEndDate: queryParams.createdEndDate
    ? new Date(queryParams.createdEndDate)
    : undefined,
  paidDate: queryParams.paidDate ? new Date(queryParams.paidDate) : undefined,
  userId: queryParams.userId,
  customerId: queryParams.customerId,
  customerType: queryParams.customerType,
  posId: queryParams.posId,
  types: queryParams.types && queryParams.types.split(',')
});

// Prepares data depending on module type
const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const params = generateParams({ queryParams: query });
  const perPage = params.perPage;

  const count = await posOrderRecordsCountQuery(models, params, {});

  let datas = [];
  const pageCount = Math.ceil(count / perPage);

  for (let page = 1; page <= pageCount; page++) {
    const orders = await posOrderRecordsQuery(
      subdomain,
      models,
      { ...params, page },
      {}
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
  { name: 'created_date', label: 'created date' },
  { name: 'created_time', label: 'created time' },
  { name: 'number', label: 'Number' },
  { name: 'pos', label: 'POS' },
  { name: 'branch', label: 'Branch' },
  { name: 'department', label: 'Department' },
  { name: 'cashier', label: 'Cashier' },
  { name: 'type', label: 'Type' },
  { name: 'billType', label: 'Bill Type' },
  { name: 'companyRD', label: 'Company RD' },
  { name: 'customerType', label: 'Customer type' },
  { name: 'customer', label: 'Customer' },
  { name: 'barcode', label: 'Barcode' },
  { name: 'subBarcode', label: 'Factor' },
  { name: 'code', label: 'Code' },
  { name: 'categoryCode', label: 'Category code' },
  { name: 'categoryName', label: 'Category name' },
  { name: 'name', label: 'Name' },
  { name: 'count', label: 'Count' },
  { name: 'firstPrice', label: 'First price' },
  { name: 'discount', label: 'Discount' },
  { name: 'discountType', label: 'Discount type' },
  { name: 'salePrice', label: 'Sale price' },
  { name: 'amount', label: 'Amount' },
  { name: 'payType', label: 'Payment type' }
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

  for (const item of data) {
    rowIndex++;
    // Iterating through basic info columns
    for (const column of headers) {
      const cellValue = await fillCellValue(column.name, item);

      addCell(column, cellValue, sheet, columnNames, rowIndex);
    }
  } // end items for loop

  return {
    name: `posOrders - ${moment().format('YYYY-MM-DD HH:mm')}`,
    response: await generateXlsx(workbook)
  };
};

export const exportFileRunner = async (req, res) => {
  const { query } = req;
  const subdomain = getSubdomain(req);

  const models = await generateModels(subdomain);

  const result = await buildFile(models, subdomain, query);

  res.attachment(`${result.name}.xlsx`);

  return res.send(result.response);
};
