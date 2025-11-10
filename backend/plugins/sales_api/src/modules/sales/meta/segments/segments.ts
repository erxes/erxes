import { salesSegmentConfigs } from '@/sales/meta/segments/segmentConfigs';
import {
  generateConditionStageIds,
  generateProductsCategoryProductIds,
} from '@/sales/meta/segments/utils';
import {
  gatherAssociatedTypes,
  getContentType,
  getPluginName,
  TCoreModuleProducerContext,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import { TSegmentProducersInput } from 'erxes-api-shared/core-modules/segments/zodSchemas';
import {
  fetchByQueryWithScroll,
  getEsIndexByContentType,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';

export const salesSegments = {
  dependentModules: salesSegmentConfigs.dependentModules,

  contentTypes: salesSegmentConfigs.contentTypes,

  propertyConditionExtender: async (
    {
      condition,
    }: TSegmentProducersInput[TSegmentProducers.PROPERTY_CONDITION_EXTENDER],
    { models, subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
    let positive;
    let ignoreThisPostiveQuery;

    const stageIds = await generateConditionStageIds(models, {
      boardId: condition.config?.boardId,
      pipelineId: condition.config?.pipelineId,
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
    {
      mainType,
      propertyType,
      positiveQuery,
      negativeQuery,
    }: TSegmentProducersInput[TSegmentProducers.ASSOCIATION_FILTER],
    { subdomain }: TCoreModuleProducerContext<IModels>,
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
        subdomain,
        pluginName: 'core',
        module: 'conformity',
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
        subdomain,
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

    return ids;
  },

  esTypesMap: async (_input, _context) => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async (
    {
      segment,
      options,
    }: TSegmentProducersInput[TSegmentProducers.INITIAL_SELECTOR],
    { subdomain }: TCoreModuleProducerContext<IModels>,
  ) => {
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
