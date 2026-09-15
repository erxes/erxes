import { FilterQuery } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IMailAddress,
  IMailMessageDocument,
} from '@/integrations/mail/@types/message';

const DEFAULT_PAGE_SIZE = 20;

const MAX_PAGE_SIZE = 500;

const QUOTE_MARKERS = [
  /<div[^>]{0,400}class="[^"]{0,200}gmail_quote/i,
  /<div[^>]{0,400}class="[^"]{0,200}yahoo_quoted/i,
  /<div[^>]{0,400}class="[^"]{0,200}moz-cite-prefix/i,
  /<div[^>]{0,400}class="[^"]{0,200}Apple-interchange-newline/i,
  /<div[^>]{0,400}id="appendonsend"/i,
  /<div[^>]{0,400}id="divRplyFwdMsg"/i,
  /<blockquote/i,
  /-{2,20}\s{0,20}Original Message\s{0,20}-{2,20}/i,
];

export const splitQuotedReply = (html: string) => {
  const start = QUOTE_MARKERS.reduce((earliest, marker) => {
    const found = html.search(marker);

    if (found === -1 || (earliest !== -1 && found >= earliest)) {
      return earliest;
    }

    return found;
  }, -1);

  if (start <= 0) {
    return {};
  }

  return { newContent: html.slice(0, start), replies: html.slice(start) };
};

const convertAddresses = (addresses: IMailAddress[] = []) =>
  addresses.map(({ name, address }) => ({ name, email: address }));

const toThreadMessage = (message: IMailMessageDocument) => {
  const body = message.body ?? '';

  return {
    _id: message._id,
    createdAt: message.createdAt,
    mailData: {
      messageId: message.messageId,
      references: message.references ?? [],
      type: message.type,
      deliveryStatus: message.deliveryStatus,
      deliveryError: message.deliveryError,
      deliveryRetryable: message.deliveryRetryable ?? false,
      bouncedRecipients: message.bouncedRecipients ?? [],
      envelopeFrom: message.envelopeFrom,
      senderMismatch: message.senderMismatch ?? false,
      from: convertAddresses(message.from),
      to: convertAddresses(message.to),
      cc: convertAddresses(message.cc),
      bcc: convertAddresses(message.bcc),
      subject: message.subject,
      body,
      ...splitQuotedReply(body),
      attachments: message.attachments,
    },
  };
};

export const readMailThread = async (
  models: IModels,
  filter: FilterQuery<IMailMessageDocument>,
  limit?: number,
) => {
  const size = Math.min(Math.max(limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

  const page = await models.MailMessages.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(size + 1);

  const hasMore = page.length > size;

  const messages = (hasMore ? page.slice(0, size) : page)
    .reverse()
    .map(toThreadMessage);

  return { messages, hasMore };
};
