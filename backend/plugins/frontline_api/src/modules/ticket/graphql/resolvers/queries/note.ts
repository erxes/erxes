import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

export const noteQueries = {
  ticketGetNote: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Note.findOne({ _id });
  },
};

requireLogin(noteQueries, 'ticketGetNote');
