import { FilterQuery } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IMailAddress,
  IMailMessageDocument,
} from '@/integrations/mail/@types/message';
import { readInboundMailReaction } from '@/integrations/mail/utils/reactions';

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

const toThreadMessage = async (
  message: IMailMessageDocument,
  subdomain: string,
) => {
  const body = message.body ?? '';
  const reactionEmoji =
    message.reactionEmoji ??
    (message.type === 'INBOX'
      ? await readInboundMailReaction(subdomain, message.attachments)
      : undefined);

  return {
    _id: message._id,
    createdAt: message.createdAt,
    mailData: {
      messageId: message.messageId,
      providerMessageId: message.providerMessageId,
      inReplyTo: message.inReplyTo,
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
      reactionEmoji,
      hasReplyTo: message.hasReplyTo ?? false,
      ...splitQuotedReply(body),
      attachments: message.attachments,
    },
  };
};

export const readMailThread = async (
  models: IModels,
  subdomain: string,
  filter: FilterQuery<IMailMessageDocument>,
  limit?: number,
) => {
  const size = Math.min(Math.max(limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

  const page = await models.MailMessages.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(size + 1);

  const hasMore = page.length > size;

  const selected = hasMore ? page.slice(0, size) : page;
  const selectedMessages = await Promise.all(
    selected.map((message) => toThreadMessage(message, subdomain)),
  );
  const selectedWireIds = new Set(
    selected.flatMap(({ messageId, providerMessageId }) =>
      [messageId, providerMessageId].filter(Boolean),
    ),
  );
  const missingTargetIds = [
    ...new Set(
      selectedMessages.flatMap(({ mailData: { reactionEmoji, inReplyTo } }) =>
        reactionEmoji && inReplyTo && !selectedWireIds.has(inReplyTo)
          ? [inReplyTo]
          : [],
      ),
    ),
  ];

  // Include paginated-out parents so reactions remain attached to their email.
  const targets = missingTargetIds.length
    ? await models.MailMessages.find({
        $and: [
          filter,
          {
            $or: [
              { messageId: { $in: missingTargetIds } },
              { providerMessageId: { $in: missingTargetIds } },
            ],
          },
        ],
      }).limit(missingTargetIds.length)
    : [];
  const targetMessages = await Promise.all(
    targets.map((message) => toThreadMessage(message, subdomain)),
  );
  const loadedMessages = [...selectedMessages, ...targetMessages];
  const wireIds = loadedMessages.flatMap(({ mailData }) =>
    [mailData.messageId, mailData.providerMessageId].filter(Boolean),
  );
  const reactionRecords = wireIds.length
    ? await models.MailMessages.find({
        $and: [
          filter,
          {
            _id: { $nin: loadedMessages.map(({ _id }) => _id) },
            inReplyTo: { $in: wireIds },
            $or: [
              { reactionEmoji: { $exists: true, $ne: '' } },
              { 'attachments.mimeType': 'text/vnd.google.email-reaction+json' },
            ],
          },
        ],
      })
        .sort({ createdAt: -1, _id: -1 })
        .limit(MAX_PAGE_SIZE)
    : [];
  const reactionMessages = await Promise.all(
    reactionRecords.map((message) => toThreadMessage(message, subdomain)),
  );
  const messages = [
    ...loadedMessages,
    ...reactionMessages.filter(({ mailData }) =>
      Boolean(mailData.reactionEmoji),
    ),
  ].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime() ||
      (left._id < right._id ? -1 : Number(left._id > right._id)),
  );
  return { messages, hasMore };
};
