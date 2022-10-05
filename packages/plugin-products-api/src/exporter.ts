import { generateModels, IModels } from './connectionResolver';
import { sendFormsMessage, sendTagsMessage } from './messageBroker';

const prepareData = async (
  models: IModels,
  subdomain: string,
  query: any
): Promise<any[]> => {
  const { contentType, segmentId } = query;

  let data: any[] = [];

  const productsFilter: any = {};

  data = await models.Products.find(productsFilter).lean();

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

const getUomData = async (item, fieldName) => {
  let value;

  if (item.subUoms && item.subUoms.length > 0) {
    for (const subUom of item.subUoms) {
      if (subUom.uomId === fieldName || subUom.ratio === fieldName) {
        // console.log(subUom.uomId);
        value = subUom.uomId || subUom.ratio;

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
  prepareExportData: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { columnsConfig, contentType, segmentId } = data;

    const docs = [] as any;
    const headers = [] as any;

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

          headers.push(`customFieldsData.${field.text}.${fieldId}`);
        } else {
          headers.push(column);
        }
      }

      for (const item of results) {
        const result = {};

        for (const column of headers) {
          if (column.startsWith('customFieldsData')) {
            const fieldId = column.split('.')[2];
            const fieldName = column.split('.')[1];

            const { value } = await getCustomFieldsData(item, fieldId);

            result[column] = value || '-';
          } else if (column.startsWith('subUoms')) {
            const fieldName = column.split('.')[1];

            const { value } = await getUomData(item, fieldName);

            result[column] = value || '-';
          } else if (column === 'categoryName') {
            const value = await models.ProductCategories.findOne({
              _id: item.categoryId
            }).lean();

            result[column] = value?.name || '-';
          } else if (column === 'tag') {
            const tags = await sendTagsMessage({
              subdomain,
              action: 'find',
              data: {
                _id: { $in: item.tagIds || [] }
              },
              isRPC: true,
              defaultValue: []
            });

            let tagNames = '';

            for (const tag of tags) {
              tagNames = tagNames.concat(tag.name, ', ');
            }

            result[column] = tagNames ? tagNames : '';
          } else {
            result[column] = item[column];
          }
        }

        docs.push(result);
      }
    } catch (e) {
      return { error: e.message };
    }
    return { docs, headers };
  }
};
