import {
  gatherAssociatedTypes,
  getContentType,
  getEsIndexByContentType,
  getPluginName,
} from 'erxes-api-shared/core-modules';
import {
  fetchByQueryWithScroll,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';

export const generateConditionStageIds = async (
  models: IModels,
  {
    boardId,
    pipelineId,
    options,
  }: {
    boardId?: string;
    pipelineId?: string;
    options?: any;
  },
) => {
  let pipelineIds: string[] = [];

  if (options && options.pipelineId) {
    pipelineIds = [options.pipelineId];
  }

  if (boardId && (!options || !options.pipelineId)) {
    const board = await models.Boards.getBoard(boardId);

    const pipelines = await models.Pipelines.find(
      {
        _id: {
          $in: pipelineId ? [pipelineId] : board.pipelines || [],
        },
      },
      { _id: 1 },
    );

    pipelineIds = pipelines.map((p) => p._id);
  }

  const stages = await models.Stages.find(
    { pipelineId: pipelineIds },
    { _id: 1 },
  );

  return stages.map((s) => s._id);
};

export const salesSegments = {
  dependentServices: [
    {
      name: 'core',
      // types: ['company', 'customer', 'lead'],
      twoWay: true,
      associated: true,
    },
    { name: 'tickets', twoWay: true, associated: true },
    { name: 'tasks', twoWay: true, associated: true },
    { name: 'purchases', twoWay: true, associated: true },
    { name: 'inbox', twoWay: true },
    {
      name: 'cars',
      twoWay: true,
      associated: true,
    },
  ],

  contentTypes: [
    {
      type: 'deal',
      description: 'Deal',
      esIndex: 'deals',
    },
  ],

  propertyConditionExtender: async ({ subdomain }, { condition, ...rest }) => {
    const models = await generateModels(subdomain);

    let positive;
    let ignoreThisPostiveQuery;

    const stageIds = await generateConditionStageIds(models, {
      boardId: condition.boardId,
      pipelineId: condition.pipelineId,
    });

    if (stageIds.length > 0) {
      positive = {
        terms: {
          stageId: stageIds,
        },
      };
    }

    if (condition.propertyName === 'stageProbability') {
      const { propertyType, propertyValue } = condition || {};

      const [_serviceName, contentType] = propertyType.split(':');

      const stageIds = await models.Stages.find({
        type: contentType,
        probability: propertyValue,
      })
        .distinct('_id')
        .lean();

      positive = {
        terms: {
          stageId: stageIds,
        },
      };
      ignoreThisPostiveQuery = true;
    }

    const productIds = await generateProductsCategoryProductIds(
      subdomain,
      condition,
    );
    if (productIds.length > 0) {
      positive = {
        bool: {
          should: productIds.map((productId) => ({
            match: { 'productsData.productId': productId },
          })),
        },
      };

      if (condition.propertyName == 'productsData.categoryId') {
        ignoreThisPostiveQuery = true;
      }
    }

    return { data: { positive, ignoreThisPostiveQuery }, status: 'success' };
  },

  associationFilter: async (
    { subdomain },
    { mainType, propertyType, positiveQuery, negativeQuery },
  ) => {
    const associatedTypes: string[] = await gatherAssociatedTypes(mainType);

    let ids: string[] = [];

    if (associatedTypes.includes(propertyType)) {
      const mainTypeIds = await fetchByQueryWithScroll({
        subdomain,
        index: await getEsIndexByContentType(propertyType),
        positiveQuery,
        negativeQuery,
      });

      ids = await sendTRPCMessage({
        pluginName: 'core',
        module: 'conformities',
        action: 'filterConformity',
        input: {
          mainType: getContentType(propertyType),
          mainTypeIds,
          relType: getContentType(mainType),
        },
      });
    } else {
      const pluginName = getPluginName(propertyType);

      if (pluginName === 'sales') {
        return { data: [], status: 'error' };
      }

      ids = [];
      await sendTRPCMessage({
        pluginName,
        module: 'segments',
        action: 'associationFilter',
        input: {
          mainType,
          propertyType,
          positiveQuery,
          negativeQuery,
        },
        defaultValue: [],
      });
    }

    return { data: ids, status: 'success' };
  },

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async ({ subdomain }, { segment, options }) => {
    const models = await generateModels(subdomain);

    let positive;

    const config = segment.config || {};

    const stageIds = await generateConditionStageIds(models, {
      boardId: config.boardId,
      pipelineId: config.pipelineId,
      options,
    });

    if (stageIds.length > 0) {
      positive = { terms: { stageId: stageIds } };
    }

    return { data: { positive }, status: 'success' };
  },
};

const generateProductsCategoryProductIds = async (subdomain, condition) => {
  let productCategoryIds: string[] = [];

  const { propertyName, propertyValue } = condition;
  if (propertyName === 'productsData.categoryId') {
    productCategoryIds.push(propertyValue);

    const products = await sendTRPCMessage({
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        categoryIds: [...new Set(productCategoryIds)],
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    const productIds = products.map((product) => product._id);

    return productIds;
  }
  return [];
};
