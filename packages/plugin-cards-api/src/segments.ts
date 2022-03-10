import { generateConditionStageIds } from './utils';

export default {
  indexesTypeContentType: {
    deal: 'deals',
    ticket: 'tickets',
    task: 'tasks'
  },

  contentTypes: ['deal', 'ticket', 'task'],

  descriptionMap: {
    'cards:deal': 'Deal',
    'cards:ticket': 'Ticket',
    'cards:task': 'Task',
    'contacts:customer': 'Customer',
    'contacts:company': 'Company'
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
    let types: string[] = [];

    if (mainType === 'deal') {
      types = [
        'contacts:customer',
        'contacts:company',
        'cards:ticket',
        'cards:task'
      ];
    }

    if (mainType === 'task') {
      types = [
        'contacts:customer',
        'contacts:company',
        'cards:ticket',
        'cards:deal'
      ];
    }

    if (mainType === 'ticket') {
      types = [
        'contacts:customer',
        'contacts:company',
        'cards:deal',
        'cards:task'
      ];
    }

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
