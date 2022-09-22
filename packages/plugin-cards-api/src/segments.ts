import { fetchByQuery } from '@erxes/api-utils/src/elasticsearch';
import { generateModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';
import { generateConditionStageIds } from './utils';
import { getEsIndexByContentType } from '@erxes/api-utils/src/segments';

const getName = type => type.replace('contacts:', '').replace('cards:', '');

export default {
  dependentServices: [
    { name: 'contacts', twoWay: true },
    { name: 'inbox', twoWay: true }
  ],

  contentTypes: [
    {
      type: 'deal',
      description: 'Deal',
      esIndex: 'deals'
    },
    {
      type: 'ticket',
      description: 'Ticket',
      esIndex: 'tickets'
    },
    { type: 'task', description: 'Task', esIndex: 'tasks' }
  ],

  propertyConditionExtender: async ({ subdomain, data: { condition } }) => {
    const models = await generateModels(subdomain);

    let positive;

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

    return { data: { positive }, status: 'success' };
  },

  associationFilter: async ({
    subdomain,
    data: { mainType, propertyType, positiveQuery, negativeQuery }
  }) => {
    let associatedTypes: string[] = [];

    if (mainType === 'cards:deal') {
      associatedTypes = [
        'contacts:customer',
        'contacts:company',
        'cards:ticket',
        'cards:task'
      ];
    }

    if (mainType === 'cards:task') {
      associatedTypes = [
        'contacts:customer',
        'contacts:company',
        'cards:ticket',
        'cards:deal'
      ];
    }

    if (mainType === 'cards:ticket') {
      associatedTypes = [
        'contacts:customer',
        'contacts:company',
        'cards:deal',
        'cards:task'
      ];
    }

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
