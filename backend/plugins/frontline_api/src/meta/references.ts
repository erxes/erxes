import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { ticketReferenceFetchers } from '~/modules/ticket/meta/references/ticketReferenceFetchers';
import { TICKET_REFERENCE_TYPES } from '~/modules/ticket/meta/references/ticketReferenceTypes';

export const frontlineReferences: TRecordReferencesConfig<IModels> = {
  types: [
    ...TICKET_REFERENCE_TYPES,
    {
      type: 'conversation',
      label: 'Conversation',
      fields: [
        {
          key: 'displayName',
          label: 'Display name',
          resolver: 'conversationDisplayName',
        },
        { key: '_id', label: 'Conversation ID' },
        { key: 'content', label: 'Content' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created at' },
      ],
    },
  ],
  fetchers: {
    ...ticketReferenceFetchers,
    conversation: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Conversations.find({ _id: { $in: ids } }).lean();
      }

      return await models.Conversations.findOne({ _id: id }).lean();
    },
  },
  resolvers: {
    conversationDisplayName: async ({ target }) => {
      const content = String(target?.content || '')
        .replace(/<[^>]*>/g, '')
        .trim();

      return content ? content.slice(0, 60) : 'Conversation';
    },
  },
  generateModels,
};
