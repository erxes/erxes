import { IModels } from '~/connectionResolvers';
import { INote } from '@/ticket/@types/note';
import { ITicketDocument } from '@/ticket/@types/ticket';
import {
  IMailAttachmentInput,
  IMailMessageDocument,
} from '@/integrations/mail/@types/message';
import {
  attachmentListToHtml,
  noteContentToHtml,
} from '@/integrations/mail/utils/noteContent';
import {
  toMailAttachments,
  toNoteAttachments,
  toUnsavedAttachments,
} from '@/integrations/mail/utils/noteAttachments';
import { inlineStorageImages } from '@/integrations/mail/utils/inlineImages';
import { findPipelineIntegration } from '@/integrations/mail/utils/pipeline';
import {
  resolveTicketRecipient,
  sendTicketMail,
} from '@/integrations/mail/utils/tickets';
import { assertSendableIntegration } from '@/integrations/mail/utils/transports/readiness';
import { splitQuotedReply } from '@/integrations/mail/utils/thread';
import { MAIL_MESSAGE_TYPES } from '@/integrations/mail/constants';

const REPLY_PREFIX = /^re\s*:/i;

const FALLBACK_SUBJECT = 'Re: your request';

const NO_RECIPIENT_ERROR =
  'This ticket has no customer email address, so the reply cannot be mailed. Add an email to the customer or write an internal note instead.';

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

export interface ITicketNoteMail {
  ticket: ITicketDocument;
  to: string;
  body: string;
  attachments: IMailAttachmentInput[];
}

export const prepareTicketNoteMail = async (
  models: IModels,
  subdomain: string,
  {
    contentId,
    content,
    attachments,
    isInternal,
  }: Pick<INote, 'contentId' | 'content' | 'attachments' | 'isInternal'>,
): Promise<ITicketNoteMail | undefined> => {
  if (isInternal || !contentId) {
    return undefined;
  }

  const ticket = await models.Ticket.findOne({ _id: contentId });

  if (!ticket) {
    return undefined;
  }

  const integration = await findPipelineIntegration(models, ticket.pipelineId);

  if (!integration) {
    return undefined;
  }

  const mailAttachments = toMailAttachments(attachments);

  const inline = inlineStorageImages(noteContentToHtml(content));

  const body =
    inline.html ||
    attachmentListToHtml(mailAttachments.map(({ name }) => name ?? ''));

  if (!body) {
    return undefined;
  }

  await assertSendableIntegration(subdomain);

  const recipient = await resolveTicketRecipient(models, subdomain, ticket._id);

  if (!recipient) {
    throw new Error(NO_RECIPIENT_ERROR);
  }

  return {
    ticket,
    to: recipient,
    body,
    attachments: [...mailAttachments, ...inline.attachments],
  };
};

export const sendTicketNoteMail = async (
  models: IModels,
  subdomain: string,
  { ticket, to, body, attachments }: ITicketNoteMail,
): Promise<string> => {
  const latest = await latestMessage(models, ticket._id);

  const parent = (await latestInbound(models, ticket._id)) ?? latest;

  const message = await sendTicketMail(models, subdomain, ticket, {
    ticketId: ticket._id,
    to: [to],
    subject: replySubject(latest?.subject, ticket.name),
    body,
    attachments,
    replyToMessageId: parent?.messageId,
    references: parent?.references ?? [],
  });

  return message._id;
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

  const attachments = toNoteAttachments(message);

  if (
    !content &&
    !attachments.length &&
    !toUnsavedAttachments(message).length
  ) {
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
      attachments,
    },
    subdomain,
    userId: author,
  });
};
