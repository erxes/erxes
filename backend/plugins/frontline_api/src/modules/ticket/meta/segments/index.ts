import {
  gatherAssociatedTypes,
  getContentType,
  getPluginName,
  TCoreModuleProducerContext,
  TSegmentProducers,
  TSegmentProducersInput,
} from 'erxes-api-shared/core-modules';
import {
  fetchByQueryWithScroll,
  getEsIndexByContentType,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ticketsSegmentConfigs } from './configs';

export const ticketsSegments = {
  dependentModules: ticketsSegmentConfigs.dependentModules,

  contentTypes: ticketsSegmentConfigs.contentTypes,

  propertyConditionExtender: async () => {
    let positive;
    let ignoreThisPostiveQuery;

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
        module: 'relation',
        action: 'filterRelationIds',
        input: {
          contentType: getContentType(propertyType),
          contentIds: mainTypeIds,
          relatedContentType: getContentType(mainType),
        },
      });
    } else {
      const pluginName = getPluginName(propertyType);

      if (pluginName === 'frontline') {
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

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async () => {
    let positive;

    return { data: { positive }, status: 'success' };
  },
};
