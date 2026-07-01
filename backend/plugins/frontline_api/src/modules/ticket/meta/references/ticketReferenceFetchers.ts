import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const ticketReferenceFetchers: TRecordReferencesConfig<IModels>['fetchers'] =
  {
    ticket: async ({ models, id, ids }) => {
      if (ids.length > 1) {
        return await models.Ticket.find({ _id: { $in: ids } }).lean();
      }

      return await models.Ticket.findOne({ _id: id }).lean();
    },
  };
