import * as moment from 'moment';
import {
  Brands,
  Channels,
  // ConversationMessages,
  Deals,
  Fields,
  FormSubmissions,
  Permissions,
  Tasks,
  Tickets,
  Users,
} from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';
import { MODULE_NAMES } from '../../constants';
import { can } from '../../permissions/utils';
import { createXlsFile, generateXlsx } from '../../utils';
import { Builder as CompanyBuildQuery, IListArgs as ICompanyListArgs } from '../coc/companies';
import { Builder as CustomerBuildQuery, IListArgs as ICustomerListArgs } from '../coc/customers';
import { fillCellValue, fillHeaders, IColumnLabel } from './spreadsheet';

// Prepares data depending on module type
const prepareData = async (query: any, user: IUserDocument): Promise<any[]> => {
  const { type } = query;

  let data: any[] = [];

  switch (type) {
    case MODULE_NAMES.COMPANY:
      if (!(await can('exportCompanies', user))) {
        throw new Error('Permission denied');
      }

      const companyParams: ICompanyListArgs = query;

      const companyQb = new CompanyBuildQuery(companyParams, {});
      await companyQb.buildAllQueries();

      const companyResponse = await companyQb.runQueries();

      data = companyResponse.list;

      break;
    case MODULE_NAMES.CUSTOMER:
      if (!(await can('exportCustomers', user))) {
        throw new Error('Permission denied');
      }

      const customerParams: ICustomerListArgs = query;

      if (customerParams.form && customerParams.popupData) {
        const messagesAggregate = await FormSubmissions.aggregate([
          {
            $match: { formId: customerParams.form, customerId: { $exists: true, $ne: null } },
          },
          {
            $group: {
              _id: null,
              customerIds: {
                $addToSet: '$customerId',
              },
            },
          },
          {
            $lookup: {
              from: 'conversation_messages',
              let: { letCustomerIds: '$customerIds' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $in: ['$customerId', '$$letCustomerIds'] }, { $ne: ['formWidgetData', null] }],
                    },
                  },
                },
              ],
              as: 'messagesWithFormData',
            },
          },
          {
            $unwind: '$messagesWithFormData',
          },
          {
            $project: {
              formWidgetData: '$messagesWithFormData.formWidgetData',
              createdAt: '$messagesWithFormData.createdAt',
            },
          },
          {
            $sort: { createdAt: -1 },
          },
        ]);

        const messages: any[] = [];

        messagesAggregate.forEach(message => {
          if (message.formWidgetData && Array.isArray(message.formWidgetData)) {
            const formData = message.formWidgetData;

            formData.push({
              _id: message._id,
              type: 'input',
              validation: 'date',
              text: 'Created',
              value: message.createdAt,
            });

            messages.push(formData);
          }
        });

        data = messages;
      } else {
        const qb = new CustomerBuildQuery(customerParams, {});
        await qb.buildAllQueries();

        const customerResponse = await qb.runQueries();

        data = customerResponse.list;
      }

      break;
    case MODULE_NAMES.DEAL:
      if (!(await can('exportDeals', user))) {
        throw new Error('Permission denied');
      }

      data = await Deals.find();

      break;
    case MODULE_NAMES.TASK:
      if (!(await can('exportTasks', user))) {
        throw new Error('Permission denied');
      }

      data = await Tasks.find();

      break;
    case MODULE_NAMES.TICKET:
      if (!(await can('exportTickets', user))) {
        throw new Error('Permission denied');
      }

      data = await Tickets.find();

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

const addCell = (col: IColumnLabel, value: string, sheet: any, columnNames: string[], rowIndex: number): void => {
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

  const fields = await Fields.find({ contentType: 'form', contentTypeId: formId }).sort({ order: 1 });

  for (const field of fields) {
    headers.push({ name: field.text, label: field.text });
  }

  headers.push({ name: 'Created', label: 'Created' });

  return headers;
};

const buildLeadFile = async (datas: any, formId: string, sheet: any, columnNames: string[], rowIndex: number) => {
  const headers: IColumnLabel[] = await fillLeadHeaders(formId);

  const displayValue = item => {
    if (!item) {
      return '';
    }

    if (item.validation === 'date') {
      return moment(item.value).format('YYYY/MM/DD HH:mm');
    }

    return item.value;
  };

  for (const data of datas) {
    rowIndex++;
    // Iterating through basic info columns
    for (const column of headers) {
      const item = await data.find(obj => obj.text === column.name);
      const cellValue = displayValue(item);

      addCell(column, cellValue, sheet, columnNames, rowIndex);
    }
  }
};

export const buildFile = async (query: any, user: IUserDocument): Promise<{ name: string; response: string }> => {
  let type = query.type;

  const data = await prepareData(query, user);

  // Reads default template
  const { workbook, sheet } = await createXlsFile();

  const columnNames: string[] = [];
  let rowIndex: number = 1;

  if (type === MODULE_NAMES.CUSTOMER && query.form && query.popupData) {
    await buildLeadFile(data, query.form, sheet, columnNames, rowIndex);

    type = 'Pop-Ups';
  } else {
    const headers: IColumnLabel[] = fillHeaders(type);

    for (const item of data) {
      rowIndex++;
      // Iterating through basic info columns
      for (const column of headers) {
        const cellValue = await fillCellValue(column.name, item);

        addCell(column, cellValue, sheet, columnNames, rowIndex);
      }

      if (type === MODULE_NAMES.CUSTOMER || type === MODULE_NAMES.COMPANY) {
        // Iterating through coc custom properties
        if (item.customFieldsData) {
          const keys = Object.getOwnPropertyNames(item.customFieldsData) || [];

          for (const fieldId of keys) {
            const propertyObj = await Fields.findOne({ _id: fieldId });

            if (propertyObj && propertyObj.text) {
              addCell(
                { name: propertyObj.text, label: propertyObj.text },
                item.customFieldsData[fieldId],
                sheet,
                columnNames,
                rowIndex,
              );
            }
          }
        }
      } // customer or company checking
    } // end items for loop
  }

  return {
    name: `${type} - ${moment().format('YYYY-MM-DD HH:mm')}`,
    response: await generateXlsx(workbook),
  };
};
