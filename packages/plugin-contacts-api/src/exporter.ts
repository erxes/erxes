import * as moment from 'moment';

import {
  createXlsFile,
  findSchemaLabels,
  generateXlsx,
  getCustomFieldsData
} from '@erxes/api-utils/src/exporter';
import { IColumnLabel, IUserDocument } from '@erxes/api-utils/src/types';
import { debugBase } from '@erxes/api-utils/src/debuggers';
import {
  COMPANY_BASIC_INFOS,
  CUSTOMER_BASIC_INFOS,
  MODULE_NAMES
} from './constants';
import {
  companySchema,
  ICompanyDocument
} from './models/definitions/companies';
import {
  customerSchema,
  ICustomerDocument
} from './models/definitions/customers';
import { fetchSegment, sendTagsMessage } from './messageBroker';

import {
  Builder as CompanyBuildQuery,
  IListArgs as ICompanyListArgs
} from './coc/companies';
import {
  Builder as CustomerBuildQuery,
  IListArgs as ICustomerListArgs
} from './coc/customers';
import { ICoreIModels, IModels } from './connectionResolver';

export const fillHeaders = (itemType: string): IColumnLabel[] => {
  let columnNames: IColumnLabel[] = [];

  switch (itemType) {
    case MODULE_NAMES.COMPANY:
      columnNames = findSchemaLabels(companySchema, COMPANY_BASIC_INFOS);
      break;
    case MODULE_NAMES.CUSTOMER:
      columnNames = findSchemaLabels(customerSchema, CUSTOMER_BASIC_INFOS);
      break;
  }

  return columnNames;
};

const getCellValue = (item, colName) => {
  const names = colName.split('.');

  if (names.length === 1) {
    return item[colName];
  } else if (names[0] === 'trackedData') {
    const trackedDatas = item.trackedData || [];

    if (trackedDatas[0]) {
      const foundedData = trackedDatas.find(data => data.field === names[1]);
      return foundedData ? foundedData.value : '';
    }

    return '';
  } else {
    const value = item[names[0]];

    return value ? value[names[1]] : '';
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
  { Customers, Companies }: IModels,
  { Users }: ICoreIModels,
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
    case 'createdAt':
      cellValue = moment(cellValue).format('YYYY-MM-DD HH:mm');
      break;

    case 'modifiedAt':
      cellValue = moment(cellValue).format('YYYY-MM-DD HH:mm');

      break;

    // customer fields

    case 'emails':
      cellValue = (item.emails || []).join(', ');
      break;
    case 'phones':
      cellValue = (item.phones || []).join(', ');
      break;
    case 'mergedIds':
      const customers: ICustomerDocument[] | null = await Customers.find({
        _id: { $in: item.mergedIds }
      });

      cellValue = customers
        .map(cus => cus.firstName || cus.primaryEmail)
        .join(', ');

      break;
    // company fields
    case 'names':
      cellValue = (item.names || []).join(', ');

      break;
    case 'parentCompanyId':
      const parent: ICompanyDocument | null = await Companies.findOne({
        _id: item.parentCompanyId
      });

      cellValue = parent ? parent.primaryName : '';

      break;

    case 'tag':
      const tags = await sendTagsMessage('find', {
        _id: { $in: item.tagIds }
      }, true, []);

      let tagNames = '';

      for (const tag of tags) {
        tagNames = tagNames.concat(tag.name, ', ');
      }

      cellValue = tags ? tagNames : '';

      break;

    case 'ownerEmail':
      const owner: IUserDocument | null = await Users.findOne({
        _id: item.ownerId
      });

      cellValue = owner ? owner.email : '';

      break;

    default:
      break;
  }

  return cellValue || emptyMsg;
};

// Prepares data depending on module type
const prepareData = async (models: IModels, coreModels: ICoreIModels, query: any, user: IUserDocument): Promise<any[]> => {
  const { type, unlimited = false, segment } = query;

  let data: any[] = [];

  const boardItemsFilter: any = {};

  if (segment) {
    const itemIds = await fetchSegment(segment);

    boardItemsFilter._id = { $in: itemIds };
  }

  switch (type) {
    case MODULE_NAMES.COMPANY:
      const companyParams: ICompanyListArgs = query;

      const companyQb = new CompanyBuildQuery(models, coreModels, companyParams, {});
      await companyQb.buildAllQueries();

      const companyResponse = await companyQb.runQueries('search', unlimited);

      data = companyResponse.list;

      break;

    case 'lead':
      const leadParams: ICustomerListArgs = query;
      const leadQp = new CustomerBuildQuery(models, coreModels, leadParams, {});
      await leadQp.buildAllQueries();

      const leadResponse = await leadQp.runQueries('search', unlimited);

      data = leadResponse.list;
      break;

    case 'visitor':
      const visitorParams: ICustomerListArgs = query;
      const visitorQp = new CustomerBuildQuery(models, coreModels, visitorParams, {});
      await visitorQp.buildAllQueries();

      const visitorResponse = await visitorQp.runQueries('search', unlimited);

      data = visitorResponse.list;
      break;

    case MODULE_NAMES.CUSTOMER:
      const customerParams: ICustomerListArgs = query;

      const qb = new CustomerBuildQuery(models, coreModels, customerParams, {});
      await qb.buildAllQueries();

      const customerResponse = await qb.runQueries('search', unlimited);

      data = customerResponse.list;

      break;

    default:
      break;
  }

  return data;
};

const addCell = (
  col: IColumnLabel,
  value: string,
  sheet: any,
  columnNames: string[],
  rowIndex: number
): void => {
  // Checking if existing column
  if (columnNames.includes(col.name)) {
    // If column already exists adding cell
    sheet.cell(rowIndex, columnNames.indexOf(col.name) + 1).value(value);
  } else {
    // Creating column
    sheet.cell(1, columnNames.length + 1).value(col.label || col.name);
    // Creating cell
    sheet.cell(rowIndex, columnNames.length + 1).value(value);

    columnNames.push(col.name);
  }
};

const fillLeadHeaders = async ({ Fields }: ICoreIModels, formId: string) => {
  const headers: IColumnLabel[] = [];

  const fields = await Fields.find({
    contentType: 'form',
    contentTypeId: formId
  }).sort({ order: 1 });

  for (const field of fields) {
    headers.push({ name: field._id, label: field.text });
  }

  headers.push({ name: 'created', label: 'Created' });

  return headers;
};

const buildLeadFile = async (
  coreModels:ICoreIModels,
  datas: any,
  formId: string,
  sheet: any,
  columnNames: string[],
  rowIndex: number
) => {
  debugBase(`Start building an excel file for popups export`);

  const headers: IColumnLabel[] = await fillLeadHeaders(coreModels, formId);

  const displayValue = item => {
    if (!item) {
      return '';
    }

    if (item.validation === 'date') {
      return moment(item.value).format('YYYY/MM/DD HH:mm');
    }

    if (item.type === 'file' && Array.isArray(item.value)) {
      return item.value[0].url;
    }

    return item.value;
  };

  for (const data of datas) {
    rowIndex++;
    // Iterating through basic info columns
    for (const column of headers) {
      const item = await data.find(
        obj =>
          obj._id === column.name || obj.text.trim() === column.label.trim()
      );

      const cellValue = displayValue(item);

      addCell(column, cellValue, sheet, columnNames, rowIndex);
    }
  }

  debugBase('End building an excel file for popups export');
};

const filterHeaders = headers => {
  const first = [] as any;
  const others = [] as any;

  for (const column of headers) {
    if (column.name.startsWith('productsData')) {
      first.push(column);
    } else {
      others.push(column);
    }
  }

  return others.concat(first);
};

export const buildFile = async (
  models: IModels,
  coreModels: ICoreIModels,
  query: any,
  user: IUserDocument
): Promise<{ name: string; response: string }> => {
  const { configs } = query;
  let type = query.type;

  const data = await prepareData(models, coreModels, query, user);

  // Reads default template
  const { workbook, sheet } = await createXlsFile();

  const columnNames: string[] = [];
  let rowIndex: number = 1;

  if (type === MODULE_NAMES.CUSTOMER && query.form && query.popupData) {
    await buildLeadFile(coreModels, data, query.form, sheet, columnNames, rowIndex);

    type = 'Forms';
  } else {
    let headers: IColumnLabel[] = fillHeaders(type);

    if (configs) {
      headers = JSON.parse(configs);
    }

    for (const item of data) {
      rowIndex++;
      // Iterating through basic info columns
      for (const column of headers) {
        if (column.name.startsWith('customFieldsData')) {
          const { field, value } = await getCustomFieldsData(
            coreModels.Fields,
            item,
            column,
            type
          );

          if (field && value) {
            addCell(
              { name: field.text, label: field.text },
              value,
              sheet,
              columnNames,
              rowIndex
            );
          }
        } else {
          const cellValue = await fillCellValue(models, coreModels, column.name, item);

          addCell(column, cellValue, sheet, columnNames, rowIndex);
        }
      }

      // customer or company checking
    } // end items for loop
  }

  return {
    name: `${type} - ${moment().format('YYYY-MM-DD HH:mm')}`,
    response: await generateXlsx(workbook)
  };
};
