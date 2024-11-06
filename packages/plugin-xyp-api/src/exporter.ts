import { generateModels, IModels } from './connectionResolver';
import {
  fetchSegment,
} from './messageBroker';
import { getServiceToFields } from './forms';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any,
): Promise<any[]> => {
  const { segmentData, page, perPage } = query;

  let data: any[] = [];

  const skip = (page - 1) * perPage;

  const filter: any = {};
  let itemIds = [];

  if (segmentData.conditions) {
    itemIds = await fetchSegment(subdomain, '', { page, perPage }, segmentData);

    filter._id = { $in: itemIds };
    data = await models.XypData.find(filter).lean();
  } else {
    data = await models.XypData.find(filter).skip(skip).limit(perPage).lean();
  }

  return data;
};

const prepareDataCount = async (
  models: IModels,
  subdomain: string,
  query: any,
): Promise<any> => {
  const { segmentData } = query;

  let data = 0;

  const filter: any = {};
  if (segmentData.conditions) {
    const itemIds = await fetchSegment(
      subdomain,
      '',
      { scroll: true, page: 1, perPage: 10000 },
      segmentData,
    );

    filter._id = { $in: itemIds };
  }

  data = await models.XypData.find(filter).countDocuments();

  return data;
};

const getExcelHeader = async (subdomain, columnsConfig) => {
  let headers = [] as any;
  const { fieldsForExcel, list } = (await getServiceToFields(subdomain)) || [];

  for (const column of columnsConfig) {
    if (column.startsWith('service.')) {
      const serviceName = column.replace('service.', '');
      const oneServiceFields = fieldsForExcel.filter((x) =>
        x.startsWith(serviceName),
      );
      headers = [...headers, ...oneServiceFields];
    } else {
      headers.push(column);
    }
  }

  return headers;
};

export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Хурдан',
    contentType: 'xyp',
    icon: 'server-alt',
  },
];

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,

  prepareExportData: async (params) => {
    const { subdomain, data } = params;
    const models = await generateModels(subdomain);

    const { columnsConfig } = data;
    let totalCount = 0;
    const excelHeader = await getExcelHeader(subdomain, columnsConfig);

    try {
      const results = await prepareDataCount(models, subdomain, data);
      totalCount = results;
    } catch (e) {
      return {
        error: e.message,
      };
    }

    return { totalCount, excelHeader };
  },

  getExportDocs: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig } = data;
    const { fieldsForExcel, list } =
      (await getServiceToFields(subdomain)) || [];
    const docs = [] as any;

    const excelHeader = await getExcelHeader(subdomain, columnsConfig);

    try {
      const results = await prepareData(models, subdomain, data);

      for (const item of results) {
        let result = {};
        for (const column of excelHeader) {
          if (column.includes('.')) {
            const splits = column.split('.');

            const data = item.data.find((one) => one.serviceName === splits[0]);

            if (data) {
              const columnValue =
                splits[1] in data?.data ? data.data[splits[1]] : '';
              result[column] = columnValue;
            }
          } else {
            result[column] = item[column];
          }
        }
        docs.push(result);
      }
    } catch (e) {
      console.log(`export error: ${e.message}`);
      return { error: e.message };
    }

    return { docs };
  },
};
