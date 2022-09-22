import { IColumnLabel } from '@erxes/api-utils/src';
import { generateModels, IModels } from './connectionResolver';
import { EXPORT_TYPES, MODULE_NAMES } from './constants';
import { fetchSegment } from './messageBroker';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { contentType, segment } = query;

  let data: any[] = [];

  const type = contentType.split(':')[1];

  const boardItemsFilter: any = {};

  if (segment) {
    const itemIds = await fetchSegment(subdomain, segment);

    boardItemsFilter._id = { $in: itemIds };
  }

  switch (type) {
    case MODULE_NAMES.DEAL:
      data = await models.Deals.find(boardItemsFilter);

      break;
    case MODULE_NAMES.TASK:
      data = await models.Tasks.find(boardItemsFilter);

      break;
    case MODULE_NAMES.TICKET:
      data = await models.Tickets.find(boardItemsFilter);
      break;
  }

  return data;
};

export default {
  exportTypes: EXPORT_TYPES,
  prepareExportData: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig, contentType } = data;
    const type = contentType.split(':')[1];

    console.log('12312');

    try {
      const result = await prepareData(models, subdomain, data);

      // const columnNames: string[] = [];
      // let rowIndex: number = 1;
      // const dealIds: string[] = [];
      // let dealRowIndex: number = 0;

      console.log(data);

      const headers = columnsConfig.map(config => {
        return { name: config, label: config };
      });

      console.log(headers);
    } catch (e) {
      console.log(e);
      return { error: e.message };
    }
  }
};
