import * as moment from 'moment';
import {
  Brands,
  Channels,
  ConversationMessages,
  Deals,
  Fields,
  FormSubmissions,
  Permissions,
  Products,
  Segments,
  Tasks,
  Tickets,
  Users
} from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';
import { debugBase } from '../../../debuggers';
import { MODULE_NAMES } from '../../constants';
import { can } from '../../permissions/utils';
import { createXlsFile, generateXlsx } from '../../utils';
import {
  Builder as CompanyBuildQuery,
  IListArgs as ICompanyListArgs
} from '../coc/companies';
import {
  Builder as CustomerBuildQuery,
  IListArgs as ICustomerListArgs
} from '../coc/customers';
import { fetchSegment } from '../segments/queryBuilder';
import { fillCellValue, fillHeaders, IColumnLabel } from './spreadsheet';

// Prepares data depending on module type
const prepareData = async (query: any, user: IUserDocument): Promise<any[]> => {
  const { type, unlimited = false, segment } = query;

  let data: any[] = [];

  const boardItemsFilter: any = {};

  const segmentObj = await Segments.findOne({ _id: segment }).lean();

  if (segment) {
    const itemIds = await fetchSegment(segmentObj);

    boardItemsFilter._id = { $in: itemIds };
  }

  switch (type) {
    case MODULE_NAMES.COMPANY:
      if (!(await can('exportCompanies', user))) {
        throw new Error('Permission denied');
      }

      const companyParams: ICompanyListArgs = query;

      const companyQb = new CompanyBuildQuery(companyParams, {});
      await companyQb.buildAllQueries();

      const companyResponse = await companyQb.runQueries('search', unlimited);

      data = companyResponse.list;

      break;

    case 'lead':
      const leadParams: ICustomerListArgs = query;
      const leadQp = new CustomerBuildQuery(leadParams, {});
      await leadQp.buildAllQueries();

      const leadResponse = await leadQp.runQueries('search', unlimited);

      data = leadResponse.list;
      break;

    case 'visitor':
      const visitorParams: ICustomerListArgs = query;
      const visitorQp = new CustomerBuildQuery(visitorParams, {});
      await visitorQp.buildAllQueries();

      const visitorResponse = await visitorQp.runQueries('search', unlimited);

      data = visitorResponse.list;
      break;

    case MODULE_NAMES.CUSTOMER:
      if (!(await can('exportCustomers', user))) {
        throw new Error('Permission denied');
      }

      const customerParams: ICustomerListArgs = query;

      if (customerParams.form && customerParams.popupData) {
        debugBase('Start an query for popups export');

        const fields = await Fields.find({
          contentType: 'form',
          contentTypeId: customerParams.form
        });

        if (fields.length === 0) {
          return [];
        }

        const messageQuery: any = {
          'formWidgetData._id': { $in: fields.map(field => field._id) },
          customerId: { $exists: true }
        };

        const messages = await ConversationMessages.find(messageQuery, {
          formWidgetData: 1,
          customerId: 1,
          createdAt: 1
        });

        const messagesMap: { [key: string]: any[] } = {};

        for (const message of messages) {
          const customerId = message.customerId || '';

          if (!messagesMap[customerId]) {
            messagesMap[customerId] = [];
          }

          messagesMap[customerId].push({
            datas: message.formWidgetData,
            createdInfo: {
              _id: 'created',
              type: 'input',
              validation: 'date',
              text: 'Created',
              value: message.createdAt
            }
          });
        }

        const uniqueCustomerIds = await FormSubmissions.find(
          { formId: customerParams.form },
          { customerId: 1, submittedAt: 1 }
        )
          .sort({
            submittedAt: -1
          })
          .distinct('customerId');

        const formDatas: any[] = [];

        for (const customerId of uniqueCustomerIds) {
          const filteredMessages = messagesMap[customerId] || [];

          for (const { datas, createdInfo } of filteredMessages) {
            const formData: any[] = datas;

            formData.push(createdInfo);

            formDatas.push(formData);
          }
        }

        debugBase('End an query for popups export');

        data = formDatas;
      } else {
        const qb = new CustomerBuildQuery(customerParams, {});
        await qb.buildAllQueries();

        const customerResponse = await qb.runQueries('search', unlimited);

        data = customerResponse.list;
      }

      break;
    case MODULE_NAMES.DEAL:
      if (!(await can('exportDeals', user))) {
        throw new Error('Permission denied');
      }

      data = await Deals.find(boardItemsFilter);

      break;
    case MODULE_NAMES.TASK:
      if (!(await can('exportTasks', user))) {
        throw new Error('Permission denied');
      }

      data = await Tasks.find(boardItemsFilter);

      break;
    case MODULE_NAMES.TICKET:
      if (!(await can('exportTickets', user))) {
        throw new Error('Permission denied');
      }

      data = await Tickets.find(boardItemsFilter);

      break;
    case MODULE_NAMES.USER:
      if (!(await can('exportUsers', user))) {
        throw new Error('Permission denied');
      }

      data = await Users.find({ isActive: true });

      break;
    case MODULE_NAMES.PERMISSION:
      if (!(await can('exportPermissions', user))) {
        throw new Error('Permission denied');
      }

      data = await Permissions.find();

      break;
    case MODULE_NAMES.BRAND:
      if (!(await can('exportBrands', user))) {
        throw new Error('Permission denied');
      }

      data = await Brands.find();

      break;
    case MODULE_NAMES.CHANNEL:
      if (!(await can('exportChannels', user))) {
        throw new Error('Permission denied');
      }

      data = await Channels.find();

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

const fillLeadHeaders = async (formId: string) => {
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
  datas: any,
  formId: string,
  sheet: any,
  columnNames: string[],
  rowIndex: number
) => {
  debugBase(`Start building an excel file for popups export`);

  const headers: IColumnLabel[] = await fillLeadHeaders(formId);

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

const fillDealProductValue = async (
  column,
  item,
  sheet,
  columnNames,
  rowIndex,
  dealIds,
  dealRowIndex
) => {
  const productsData = item.productsData;

  if (productsData.length === 0) {
    return;
  }

  if (dealIds.length === 0) {
    dealIds.push(item._id);
  } else if (!dealIds.includes(item._id)) {
    dealIds.push(item._id);
    rowIndex = dealRowIndex;
  }

  dealRowIndex = rowIndex;

  for (const productData of productsData) {
    let cellValue = '';
    let product;

    switch (column.name) {
      case 'productsData.amount':
        cellValue = productData.amount;
        break;

      case 'productsData.name':
        product = await Products.getProduct({
          _id: productData.productId
        });

        cellValue = product.name;
        break;

      case 'productsData.code':
        product = await Products.getProduct({
          _id: productData.productId
        });

        cellValue = product.code;
        break;

      case 'productsData.discount':
        cellValue = productData.discount;
        break;

      case 'productsData.discountPercent':
        cellValue = productData.discountPercent;
        break;

      case 'productsData.currency':
        cellValue = productData.amount;
        break;

      case 'productsData.tax':
        cellValue = productData.tax;
        break;

      case 'productsData.taxPercent':
        cellValue = productData.taxPercent;
        break;
    }

    if (cellValue) {
      addCell(column, cellValue, sheet, columnNames, dealRowIndex);

      dealRowIndex++;
    }
  }

  return { rowIndex, dealRowIndex };
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
  query: any,
  user: IUserDocument
): Promise<{ name: string; response: string }> => {
  const { configs } = query;
  let type = query.type;

  const data = await prepareData(query, user);

  // Reads default template
  const { workbook, sheet } = await createXlsFile();

  const columnNames: string[] = [];
  let rowIndex: number = 1;
  const dealIds: string[] = [];
  let dealRowIndex: number = 0;

  if (type === MODULE_NAMES.CUSTOMER && query.form && query.popupData) {
    await buildLeadFile(data, query.form, sheet, columnNames, rowIndex);

    type = 'Forms';
  } else {
    let headers: IColumnLabel[] = fillHeaders(type);

    if (configs) {
      headers = JSON.parse(configs);
    }

    if (type === MODULE_NAMES.DEAL) {
      headers = filterHeaders(headers);
    }

    for (const item of data) {
      rowIndex++;
      // Iterating through basic info columns
      for (const column of headers) {
        if (column.name.startsWith('customFieldsData')) {
          if (item.customFieldsData && item.customFieldsData.length > 0) {
            for (const customFeild of item.customFieldsData) {
              const field = await Fields.findOne({
                text: column.label.trim(),
                contentType: type === 'lead' ? 'customer' : type
              });

              if (field && field.text) {
                let value = customFeild.value;

                if (Array.isArray(value)) {
                  value = value.join(', ');
                }

                if (field.validation === 'date') {
                  value = moment(value).format('YYYY-MM-DD HH:mm');
                }

                addCell(
                  { name: field.text, label: field.text },
                  value,
                  sheet,
                  columnNames,
                  rowIndex
                );
              }
            }
          }
        }
        if (column.name.startsWith('productsData')) {
          const indexes = await fillDealProductValue(
            column,
            item,
            sheet,
            columnNames,
            rowIndex,
            dealIds,
            dealRowIndex
          );

          rowIndex = indexes?.rowIndex;
          dealRowIndex = indexes?.dealRowIndex;
        } else {
          let index = rowIndex;
          if (type === MODULE_NAMES.DEAL) {
            index = dealRowIndex === 0 ? rowIndex : dealRowIndex;
          }

          const cellValue = await fillCellValue(column.name, item);

          addCell(column, cellValue, sheet, columnNames, index);
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

// [
//   {
//     _id: '0.9085203296297069',
//     name: 'name',
//     label: 'Name',
//     type: 'String',
//     checked: true,
//     order: 0
//   },
//   {
//     _id: '0.34630985142840953',
//     name: 'productsData.discount',
//     label: 'Discount',
//     type: 'Number',
//     checked: true,
//     order: 0
//   },
//   {
//     _id: '0.4241546336784805',
//     name: 'productsData.amount',
//     label: 'Amount',
//     type: 'Number',
//     checked: true,
//     order: 0
//   },
//   {
//     _id: '0.05714234631170023',
//     name: 'stageId',
//     label: 'Stage',
//     type: 'stage',
//     checked: true,
//     order: 0
//   },
//   {
//     _id: '0.5302566309557204',
//     name: 'modifiedBy',
//     label: 'Modified by',
//     type: 'user',
//     selectOptions: [[Object]],
//     checked: true,
//     order: 0
//   },
//   {
//     _id: '0.6107598719626994',
//     name: 'productsData.name',
//     label: 'Product Name',
//     checked: true,
//     order: 0
//   },
//   {
//     _id: '0.5257280770849682',
//     name: 'productsData.code',
//     label: 'Product Code',
//     checked: true,
//     order: 0
//   }
// ];
