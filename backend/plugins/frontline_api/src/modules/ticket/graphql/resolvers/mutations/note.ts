import { INoteDocument } from '@/ticket/@types/note';
import { IAttachment } from 'erxes-api-shared/core-types';
import { mailTicketNote } from '@/integrations/mail/utils/notes';
import { IContext } from '~/connectionResolvers';

export const noteMutations = {
  ticketCreateNote: async (
    _parent: undefined,
    {
      content,
      contentId,
      mentions,
      attachments,
      isInternal,
    }: {
      content: string;
      contentId: string;
      mentions?: string[];
      attachments?: IAttachment[];
      isInternal?: boolean;
    },
    { models, user, subdomain }: IContext,
  ) => {
    const userId = user._id || '';

    const mailMessageId = await mailTicketNote(models, subdomain, {
      content,
      contentId,
      attachments,
      isInternal,
    });

    return models.Note.createNote({
      doc: {
        content,
        contentId,
        mentions,
        attachments,
        isInternal,
        createdBy: user._id,
        mailMessageId,
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
