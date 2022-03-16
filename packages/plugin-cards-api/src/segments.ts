import { generateModels } from './connectionResolver';
import { generateConditionStageIds } from './utils';

export default {
  indexesTypeContentType: {
    'cards:deal': 'deals',
    'cards:ticket': 'tickets',
    'cards: task': 'tasks'
  },

  contentTypes: ['deal', 'ticket', 'task'],

  descriptionMap: {
    deal: 'Deal',
    ticket: 'Ticket',
    task: 'Task',
    customer: 'Customer',
    company: 'Company',
    converstaion: 'Conversation'
  },

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

  associationTypes: async ({}) => {
    const types: string[] = [
      'cards:deal',
      'contacts:customer',
      'contacts:company',
      'cards:ticket',
      'cards:task',
      'inbox:conversation'
    ];

    return { data: types, status: 'success' };
  },

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async ({ subdomain, data: { segment, options } }) => {
    const models = await generateModels(subdomain);

    let positive;

    const stageIds = await generateConditionStageIds(models, {
      boardId: segment.boardId,
      pipelineId: segment.pipelineId,
      options
    });

    if (stageIds.length > 0) {
      positive = { terms: { stageId: stageIds } };
    }

    return { data: { positive }, status: 'success' };
  }
};
