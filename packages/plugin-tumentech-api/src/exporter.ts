import { generateModels, IModels } from './connectionResolver';
import {
  fetchSegment,
  sendContactsMessage,
  sendCoreMessage
} from './messageBroker';
import * as moment from 'moment';
import { ICarCategoryDocument } from './models/definitions/tumentech';

export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Tumentech',
    contentType: 'car',
    icon: 'car'
  }
];

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { contentType, segmentData } = query;

  const type = contentType.split(':')[1];

  let data: any[] = [];

  const contactsFilter: any = {};

  if (segmentData.conditions) {
    const itemIds = await fetchSegment(
      subdomain,
      '',
      { scroll: true, page: 1, perPage: 10000 },
      segmentData
    );

    contactsFilter._id = { $in: itemIds };
  }

  data = await models.Cars.find(contactsFilter).lean();

  return data;
};

export const fillValue = async (
  models: IModels,
  subdomain: string,
  column: string,
  item: any
): Promise<string> => {
  let value = item[column];

  switch (column) {
    case 'createdAt':
      value = moment(value).format('YYYY-MM-DD HH:mm');
      break;

    case 'modifiedAt':
      value = moment(value).format('YYYY-MM-DD HH:mm');

      break;

    case 'carCategoryId':
      const category: ICarCategoryDocument | null = await models.CarCategories.findOne(
        {
          _id: item.carCategoryId
        }
      );

      value = category ? category.name : '';

      break;

    case 'parentCarCategoryId':
      const parentCategory: ICarCategoryDocument | null = await models.CarCategories.findOne(
        {
          _id: item.parentCarCategoryId
        }
      );

      value = parentCategory ? parentCategory.name : '';

      break;

    case 'drivers':
      const customerIds = await sendCoreMessage({
        subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: 'car',
          mainTypeId: item._id.toString(),
          relTypes: ['customer']
        },
        isRPC: true,
        defaultValue: []
      });

      const customers = await sendContactsMessage({
        subdomain,
        action: 'customers.find',
        data: { _id: { $in: customerIds } },
        isRPC: true,
        defaultValue: []
      });

      customers
        .map(customer => {
          value = customer.firstName || '';
        })
        .join(', ');

      break;

    default:
      break;
  }

  return value || '-';
};

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,

  prepareExportData: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig } = data;

    const docs = [] as any;
    const headers = [] as any;
    const excelHeader = [] as any;

    try {
      const results = await prepareData(models, subdomain, data);

      for (const column of columnsConfig) {
        headers.push(column);
      }

      for (const item of results) {
        const result = {};

        for (const column of headers) {
          const value = await fillValue(models, subdomain, column, item);

          result[column] = value || '-';
        }

        docs.push(result);
      }

      for (const header of headers) {
        excelHeader.push(header);
      }
    } catch (e) {
      return { error: e.message };
    }
    return { docs, excelHeader };
  }
};
