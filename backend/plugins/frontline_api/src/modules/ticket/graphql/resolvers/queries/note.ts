import { FilterQuery } from 'mongoose';
import { INoteDocument, TNoteType } from '@/ticket/@types/note';
import { IContext } from '~/connectionResolvers';

/**
 * Notes written before comments existed have no `type`, so anything that is
 * not explicitly a comment is an internal note.
 */
export const buildNoteTypeFilter = (
  type?: string,
): FilterQuery<INoteDocument> =>
  type === 'comment' ? { type: 'comment' } : { type: { $ne: 'comment' } };

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
    { contentId, type }: { contentId: string; type?: TNoteType },
    { models }: IContext,
  ) => {
    return models.Note.find({
      contentId,
      ...buildNoteTypeFilter(type),
    })
      .sort({ createdAt: 1 })
      .lean();
  },
};
