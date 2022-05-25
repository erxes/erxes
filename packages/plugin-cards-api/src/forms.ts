import { generateFields } from './fieldUtils';
import { getBoardsAndPipelines } from './utils';

export default {
  types: [
    {
      description: 'Tickets',
      type: 'ticket'
    },
    {
      description: 'Tasks',
      type: 'task'
    },
    {
      description: 'Sales pipelines',
      type: 'deal'
    }
  ],
  fields: generateFields,
  groupsFilter: async ({ data: { config, contentType } }) => {
    const { boardId, pipelineId } = config || {};

    if (!boardId || !pipelineId) {
      return {};
    }

    return {
      contentType,

      $and: [
        {
          $or: [
            {
              'config.boardIds': boardId
            },
            {
              'config.boardIds': {
                $size: 0
              }
            }
          ]
        },
        {
          $or: [
            {
              'config.pipelineIds': pipelineId
            },
            {
              'config.pipelineIds': {
                $size: 0
              }
            }
          ]
        }
      ]
    };
  },
  fieldsGroupsHook: ({ data }) => getBoardsAndPipelines(data)
};
