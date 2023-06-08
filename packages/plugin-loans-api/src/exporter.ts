import { generateModels, IModels } from './connectionResolver';
import { IMPORT_EXPORT_TYPES } from './imports';
import * as moment from 'moment';

const prepareData = async (
  models: IModels,
  _subdomain: string,
  _query: any
): Promise<any[]> => {
  let data: any[] = [];

  const productsFilter: any = {};

  data = await models.Contracts.find(productsFilter).lean();

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
      value = moment(value).format('YYYY-MM-DD');
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
