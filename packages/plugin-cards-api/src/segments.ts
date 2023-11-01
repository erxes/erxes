import { fetchByQuery } from '@erxes/api-utils/src/elasticsearch';
import { generateModels } from './connectionResolver';
import {
  sendCommonMessage,
  sendCoreMessage,
  sendProductsMessage
} from './messageBroker';
import { generateConditionStageIds } from './utils';
import {
  gatherAssociatedTypes,
  getEsIndexByContentType,
  getName,
  getServiceName
} from '@erxes/api-utils/src/segments';

export default {
  dependentServices: [
    { name: 'contacts', twoWay: true, associated: true },
    { name: 'inbox', twoWay: true }
  ],

  contentTypes: [
    {
      type: 'deal',
      description: 'Deal',
      esIndex: 'deals'
    },
    {
      type: 'purchase',
      description: 'Purchase',
      esIndex: 'purchases'
    },
    {
      type: 'ticket',
      description: 'Ticket',
      esIndex: 'tickets'
    },
    {
      type: 'task',
      description: 'Task',
      esIndex: 'tasks'
    }
  ],

  propertyConditionExtender: async ({ subdomain, data: { condition } }) => {
    const models = await generateModels(subdomain);

    let positive;
    let ignoreThisPostiveQuery;

    const stageIds = await generateConditionStageIds(models, {
      boardId: condition.boardId,
      pipelineId: condition.pipelineId
    });

    if (stageIds.length > 0) {
      positive = {
        terms: {
          stageId: stageIds
        }
      };
    }

    const productIds = await generateProductsCategoryProductIds(
      subdomain,
      condition
    );
    if (productIds.length > 0) {
      positive = {
        bool: {
          should: productIds.map(productId => ({
            match: { 'productsData.productId': productId }
          }))
        }
      };

      if (condition.propertyName == 'productsData.categoryId') {
        ignoreThisPostiveQuery = true;
      }
    }

    return { data: { positive, ignoreThisPostiveQuery }, status: 'success' };
  },

  associationFilter: async ({
    subdomain,
    data: { mainType, propertyType, positiveQuery, negativeQuery }
  }) => {
    const associatedTypes: string[] = await gatherAssociatedTypes(mainType);

    let ids: string[] = [];

    if (associatedTypes.includes(propertyType)) {
      const mainTypeIds = await fetchByQuery({
        subdomain,
        index: await getEsIndexByContentType(propertyType),
        positiveQuery,
        negativeQuery
      });

      ids = await sendCoreMessage({
        subdomain,
        action: 'conformities.filterConformity',
        data: {
          mainType: getName(propertyType),
          mainTypeIds,
          relType: getName(mainType)
        },
        isRPC: true
      });
    } else {
      ids = await sendCommonMessage({
        serviceName: getServiceName(propertyType),
        subdomain,
        action: 'segments.associationFilter',
        data: {
          mainType,
          propertyType,
          positiveQuery,
          negativeQuery
        },
        defaultValue: [],
        isRPC: true
      });
    }

    return { data: ids, status: 'success' };
  },

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async ({ subdomain, data: { segment, options } }) => {
    const models = await generateModels(subdomain);

    let positive;

    const config = segment.config || {};

    const stageIds = await generateConditionStageIds(models, {
      boardId: config.boardId,
      pipelineId: config.pipelineId,
      options
    });

    if (stageIds.length > 0) {
      positive = { terms: { stageId: stageIds } };
    }

    return { data: { positive }, status: 'success' };
  }
};

const generateProductsCategoryProductIds = async (subdomain, condition) => {
  let productCategoryIds: string[] = [];

  const { propertyName, propertyValue } = condition;
  if (propertyName === 'productsData.categoryId') {
    productCategoryIds.push(propertyValue);

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        categoryIds: [...new Set(productCategoryIds)],
        fields: { _id: 1 }
      },
      isRPC: true,
      defaultValue: []
    });

    const productIds = products.map(product => product._id);

    return productIds;
  }
  return [];
};
