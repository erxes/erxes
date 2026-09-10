import { IModels } from '~/connectionResolvers';
import { INoteDocument } from '@/ticket/@types/note';
import { debugError } from '@/integrations/mail/debuggers';
import { IMailMessageDocument } from '@/integrations/mail/@types/message';
import { noteContentToHtml } from '@/integrations/mail/utils/noteContent';
import { findPipelineIntegration } from '@/integrations/mail/utils/pipeline';
import { sendTicketMail } from '@/integrations/mail/utils/tickets';
import { splitQuotedReply } from '@/integrations/mail/utils/thread';
import { MAIL_MESSAGE_TYPES } from '@/integrations/mail/constants';

const REPLY_PREFIX = /^re\s*:/i;

const FALLBACK_SUBJECT = 'Re: your request';

const latestMessage = (models: IModels, ticketId: string) =>
  models.MailMessages.findOne({ ticketId })
    .sort({ createdAt: -1, _id: -1 })
    .lean();

const latestInbound = (models: IModels, ticketId: string) =>
  models.MailMessages.findOne({ ticketId, type: MAIL_MESSAGE_TYPES.INBOX })
    .sort({ createdAt: -1, _id: -1 })
    .lean();

const replySubject = (latest?: string, fallback?: string) => {
  const subject = (latest ?? fallback ?? '').trim();

  if (!subject) {
    return FALLBACK_SUBJECT;
  }

  return REPLY_PREFIX.test(subject) ? subject : `Re: ${subject}`;
};

export const mailTicketNote = async (
  models: IModels,
  subdomain: string,
  note: INoteDocument,
): Promise<INoteDocument> => {
  if (note.isInternal || note.mailMessageId || !note.contentId) {
    return note;
  }

  const ticket = await models.Ticket.findOne({ _id: note.contentId });

  if (!ticket) {
    return note;
  }

  const integration = await findPipelineIntegration(models, ticket.pipelineId);

  if (!integration) {
    return note;
  }

  try {
    const body = noteContentToHtml(note.content);

    if (!body) {
      return note;
    }

    const latest = await latestMessage(models, ticket._id);

    const parent = (await latestInbound(models, ticket._id)) ?? latest;

    const message = await sendTicketMail(models, subdomain, ticket, {
      ticketId: ticket._id,
      subject: replySubject(latest?.subject, ticket.name),
      body,
      replyToMessageId: parent?.messageId,
      references: parent?.references ?? [],
    });

    const updated = await models.Note.findOneAndUpdate(
      { _id: note._id },
      { $set: { mailMessageId: message._id } },
      { new: true },
    );

    return updated ?? note;
  } catch (e) {
    debugError('Note could not be mailed to the requester:', e);

    return note;
  }
};

export const noteFromMail = async ({
  models,
  subdomain,
  ticketId,
  customerId,
  message,
}: {
  models: IModels;
  subdomain: string;
  ticketId: string;
  customerId: string;
  message: IMailMessageDocument;
}) => {
  const claimed = await models.Note.findOne({ mailMessageId: message._id });

  if (claimed) {
    return claimed;
  }

  const body = message.body ?? '';

  const content = (splitQuotedReply(body).newContent ?? body).trim();

  if (!content) {
    return null;
  }

  const author = `cp:${customerId}`;

  return models.Note.createNote({
    doc: {
      content,
      contentId: ticketId,
      createdBy: author,
      isInternal: false,
      mailMessageId: message._id,
    },
    subdomain,
    userId: author,
  });
};
