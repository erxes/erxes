import { INoteDocument } from '@/note/types';
import { IContext } from '~/connectionResolvers';

export const noteMutations = {
  createNote: async (
    _parent: undefined,
    { content, contentId, mentions },
    { models, user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('noteCreate');

    return models.Note.createNote({
      doc: {
        content,
        contentId,
        mentions,
        createdBy: user._id,
      },
      subdomain,
    });
  },

  updateNote: async (
    _parent: undefined,
    params: INoteDocument,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('noteUpdate');

    return models.Note.updateNote(params);
  },

  deleteNote: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('noteRemove');

    return models.Note.removeNote({ _id, userId: user._id });
  },
};
