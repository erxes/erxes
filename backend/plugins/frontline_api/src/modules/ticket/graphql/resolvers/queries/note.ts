import { IContext } from '~/connectionResolvers';

export const noteQueries = {
  ticketGetNote: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Note.findOne({ _id });
  },

  ticketGetNotes: async (
    _parent: undefined,
    { contentId, isInternal }: { contentId: string; isInternal?: boolean },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('showTickets');

    return models.Note.find({
      contentId,
      ...(isInternal === undefined ? {} : { isInternal }),
    })
      .sort({ createdAt: -1 })
      .lean();
  },
};
