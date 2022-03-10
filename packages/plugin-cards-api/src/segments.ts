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
    company: 'Company'
  },

  propertyConditionExtender: async ({ condition }) => {
    let positive;

    const stageIds = await generateConditionStageIds({
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

  associationTypes: async ({ mainType }) => {
    const types: string[] = [
      'cards:deal',
      'contacts:customer',
      'contacts:company',
      'cards:ticket',
      'cards:task'
    ];

    return { data: types, status: 'success' };
  },

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  initialSelector: async ({ segment, options }) => {
    let positive;

    const stageIds = await generateConditionStageIds({
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
