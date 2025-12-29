import { INoteDocument } from '@/ticket/@types/note';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

export const noteMutations = {
  ticketCreateNote: async (
    _parent: undefined,
    { content, contentId, mentions },
    { models, user, subdomain }: IContext,
  ) => {
    const userId = user._id || '';
    return models.Note.createNote({
      doc: {
        content,
        contentId,
        mentions,
        createdBy: user._id,
      },
      subdomain,
      userId,
    });
  },

  ticketUpdateNote: async (
    _parent: undefined,
    params: INoteDocument,
    { models }: IContext,
  ) => {
    return models.Note.updateNote(params);
  },

  ticketDeleteNote: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) => {
    return models.Note.removeNote({ _id, userId: user._id });
  },
};

requireLogin(noteMutations, 'createNote');
requireLogin(noteMutations, 'updateNote');
requireLogin(noteMutations, 'deleteNote');
