import { generateModels, IModels } from './connectionResolver';
import { EXPORT_TYPES, MODULE_NAMES } from './constants';
import {
  fetchSegment,
  sendFormsMessage
  // sendProductsMessage
} from './messageBroker';

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

// const fillDealProductValue = async (
//   subdomain,
//   column,
//   item,
//   sheet,
//   columnNames,
//   rowIndex,
//   dealIds,
//   dealRowIndex
// ) => {
//   const productsData = item.productsData;

//   if (productsData.length === 0) {
//     rowIndex++;
//     dealRowIndex++;

//     addCell(column, '-', sheet, columnNames, dealRowIndex);

//     return { rowIndex, dealRowIndex };
//   }

//   if (dealIds.length === 0) {
//     dealIds.push(item._id);
//   } else if (!dealIds.includes(item._id)) {
//     dealIds.push(item._id);
//     rowIndex = dealRowIndex;
//   }

//   dealRowIndex = rowIndex;

//   for (const productData of productsData) {
//     let cellValue = '';
//     let product;

//     switch (column.name) {
//       case 'productsData.amount':
//         cellValue = productData.amount;
//         break;

//       case 'productsData.name':
//         product =
//           (await sendProductsMessage({
//             subdomain,
//             action: 'findOne',
//             data: { _id: productData.productId },
//             isRPC: true
//           })) || {};

//         cellValue = product.name;
//         break;

//       case 'productsData.code':
//         product =
//           (await sendProductsMessage({
//             subdomain,
//             action: 'findOne',
//             data: { _id: productData.productId },
//             isRPC: true
//           })) || {};

//         cellValue = product.code;
//         break;

//       case 'productsData.discount':
//         cellValue = productData.discount;
//         break;

//       case 'productsData.discountPercent':
//         cellValue = productData.discountPercent;
//         break;

//       case 'productsData.currency':
//         cellValue = productData.amount;
//         break;

//       case 'productsData.tax':
//         cellValue = productData.tax;
//         break;

//       case 'productsData.taxPercent':
//         cellValue = productData.taxPercent;
//         break;
//     }

//     if (cellValue) {
//       addCell(column, cellValue, sheet, columnNames, dealRowIndex);

//       dealRowIndex++;
//     }
//   }

//   return { rowIndex, dealRowIndex };
// };

export default {
  exportTypes: EXPORT_TYPES,

  insertttttExportItems: async ({ subdomain, data }) => {
    console.log('dddddddddddddddddddddddddddddddddddddddddd');
    const models = await generateModels(subdomain);

    const { docs, contentType } = data;

    try {
      return console.log('333333333333333333333');
    } catch (e) {
      console.log(e, '333333333333333333333');
      return { error: e.message };
    }
  },

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
        }
        // else if (column.startsWith('productsData')) {
        //   const indexes = await fillDealProductValue(
        //     subdomain,
        //     column,
        //     item,
        //     sheet,
        //     columnNames,
        //     rowIndex,
        //     dealIds,
        //     dealRowIndex
        //   );

        //   rowIndex = indexes?.rowIndex;
        //   dealRowIndex = indexes?.dealRowIndex;

        // }
        else {
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
