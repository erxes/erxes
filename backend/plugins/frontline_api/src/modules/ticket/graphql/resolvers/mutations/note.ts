import { INoteDocument } from '@/ticket/@types/note';
import { IAttachment } from 'erxes-api-shared/core-types';
import {
  prepareTicketNoteMail,
  sendTicketNoteMail,
} from '@/integrations/mail/utils/notes';
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

    const mail = await prepareTicketNoteMail(models, subdomain, {
      content,
      contentId,
      attachments,
      isInternal,
    });

    const note = await models.Note.createNote({
      doc: {
        content,
        contentId,
        mentions,
        attachments,
        isInternal,
        createdBy: user._id,
      },
      subdomain,
      userId,
    });

    if (!mail) {
      return note;
    }

    const mailMessageId = await sendTicketNoteMail(
      models,
      subdomain,
      mail,
    ).catch(async (e) => {
      await models.Note.removeNote({ _id: note._id, userId });

      throw e;
    });

    const mailed = await models.Note.findOneAndUpdate(
      { _id: note._id },
      { $set: { mailMessageId } },
      { new: true },
    );

    return mailed ?? note;
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
