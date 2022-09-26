import { generateModels, IModels } from './connectionResolver';
import { EXPORT_TYPES, MODULE_NAMES } from './constants';
import { fetchSegment, sendFormsMessage } from './messageBroker';
import * as moment from 'moment';

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
      data = await models.Deals.find(boardItemsFilter).lean();

      break;
    case MODULE_NAMES.TASK:
      data = await models.Tasks.find(boardItemsFilter).lean();

      break;
    case MODULE_NAMES.TICKET:
      data = await models.Tickets.find(boardItemsFilter).lean();
      break;
  }

  return data;
};

const getCustomFieldsData = async (item, fieldId) => {
  let value;

  if (item.customFieldsData && item.customFieldsData.length > 0) {
    for (const customFeild of item.customFieldsData) {
      if (customFeild.field === fieldId) {
        value = customFeild.value;

        if (Array.isArray(value)) {
          value = value.join(', ');
        }

        return { value };
      }
    }
  }

  return { value };
};

export default {
  exportTypes: EXPORT_TYPES,
  prepareExportData: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig, contentType } = data;

    const finalValue = [] as any;
    const finalColumnsConfigs = [] as string[];

    try {
      const results = await prepareData(models, subdomain, data);

      for (const column of columnsConfig) {
        if (column.startsWith('customFieldsData')) {
          const fieldId = column.split('.')[1];
          const field = await sendFormsMessage({
            subdomain,
            action: 'fields.findOne',
            data: {
              query: { _id: fieldId }
            },
            isRPC: true
          });

          finalColumnsConfigs.push(`customFieldsData.${field.text}.${fieldId}`);
        } else {
          finalColumnsConfigs.push(column);
        }
      }

      for (const item of results) {
        const result = {};

        for (const column of finalColumnsConfigs) {
          if (column.startsWith('customFieldsData')) {
            const fieldId = column.split('.')[2];

            const { value } = await getCustomFieldsData(item, fieldId);

            result[column] = value || '-';
          } else {
            result[column] = item[column];
          }
        }

        finalValue.push(result);
      }
    } catch (e) {
      return { error: e.message };
    }

    return { finalValue, columnsConfig };
  }
};
