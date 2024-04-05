import { generateFields } from './fieldUtils';
import { generateSystemFields, getBoardsAndPipelines } from './utils';

const relations = (type) => {
  return [
    {
      name: 'companyIds',
      label: 'Companies',
      relationType: 'contacts:company',
    },
    {
      name: 'customerIds',
      label: 'Customers',
      relationType: 'contacts:customer',
    },
    {
      name: 'ticketIds',
      label: 'Tickets',
      relationType: 'tickets',
    },
  ].filter((r) => r.relationType !== type);
};

export default {
  types: [
    {
      description: 'Tickets',
      type: 'ticket',
      relations: relations('tickets'),
    },
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
              'config.boardIds': boardId,
            },
            {
              'config.boardIds': {
                $size: 0,
              },
            },
          ],
        },
        {
          $or: [
            {
              'config.pipelineIds': pipelineId,
            },
            {
              'config.pipelineIds': {
                $size: 0,
              },
            },
          ],
        },
      ],
    };
  },
  fieldsGroupsHook: ({ data }) => getBoardsAndPipelines(data),
  systemFields: generateSystemFields,
};
