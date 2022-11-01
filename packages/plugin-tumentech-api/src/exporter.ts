import { generateModels, IModels } from './connectionResolver';
import { fetchSegment } from './messageBroker';
import * as moment from 'moment';

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
