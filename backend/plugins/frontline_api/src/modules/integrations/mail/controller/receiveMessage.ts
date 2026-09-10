import { Request, Response } from 'express';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import {
  IInboundAddress,
  IInboundMailPayload,
} from '@/integrations/mail/@types/webhook';
import {
  IMailAddress,
  IMailAttachment,
} from '@/integrations/mail/@types/message';
import {
  MAIL_MESSAGE_TYPES,
  MAIL_SIGNATURE_HEADER,
  MAIL_TIMESTAMP_HEADER,
} from '@/integrations/mail/constants';
import {
  addressDomain,
  parseTaggedAddress,
} from '@/integrations/mail/utils/address';
import { ensureMailIndexes } from '@/integrations/mail/utils/indexes';
import { checkInboundRate } from '@/integrations/mail/utils/rateLimit';
import {
  hasUnstoredAttachment,
  resolveInlineImages,
  storeAttachments,
} from '@/integrations/mail/utils/attachments';
import { isAutomatedMessage } from '@/integrations/mail/utils/autoReply';
import { isDuplicateKeyError } from '@/integrations/mail/utils/mongoErrors';
import {
  createTicketFromMail,
  isTicketOpen,
} from '@/integrations/mail/utils/tickets';
import { commentFromMail } from '@/integrations/mail/utils/comments';
import { captureForwardVerification } from '@/integrations/mail/utils/forwardVerification';
import { describeError } from '@/integrations/mail/utils/errors';
import { mailScopeId } from '@/integrations/mail/utils/scope';
import { verifySignature } from '@/integrations/mail/utils/signature';
import { resolveInboundKeys } from '@/integrations/mail/utils/inboundKeys';

const SUBJECT_PREFIX = /^\s*(?:re|fwd?|aw|antw|sv|vs)(?:\s*\[\d+\])?\s*:\s*/i;

interface IInboundSender {
  address: string;
  envelopeFrom?: string;
  mismatch: boolean;
  replyTag?: string;
}

const normalizeAddress = (value?: string) => (value || '').trim().toLowerCase();

const resolveReceivedAt = (value?: string) => {
  const now = new Date();

  if (!value) {
    return now;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) || parsed > now ? now : parsed;
};

const readDeliveredTo = (headers?: Record<string, string>) =>
  (headers?.['delivered-to'] ?? '')
    .split(',')
    .map((entry) => normalizeAddress(entry).replace(/^<|>$/g, ''))
    .filter(Boolean);

// A forwarding mailbox hands the message over under its provider's own envelope
// sender — Gmail uses a rotating postmaster@mail-....google.com relay — so the
// envelope can never name the mailbox itself. Delivered-To can, and does.
const isForwardedBy = (
  integration: IMailIntegrationDocument,
  envelopeFrom: string,
  deliveredTo: string[],
) => {
  const forwardFrom = normalizeAddress(integration.forwardFrom);

  if (!forwardFrom) {
    return false;
  }

  if (deliveredTo.includes(forwardFrom)) {
    return true;
  }

  return (
    envelopeFrom === forwardFrom ||
    addressDomain(envelopeFrom) === addressDomain(forwardFrom)
  );
};

const isSenderMismatch = (
  integration: IMailIntegrationDocument,
  headerFrom: string,
  envelopeFrom: string,
  deliveredTo: string[],
) =>
  Boolean(
    headerFrom &&
      envelopeFrom &&
      parseTaggedAddress(envelopeFrom).address !==
        parseTaggedAddress(headerFrom).address &&
      !isForwardedBy(integration, envelopeFrom, deliveredTo),
  );

const normalizeSubject = (subject?: string) => {
  let value = (subject || '').trim();

  while (SUBJECT_PREFIX.test(value)) {
    value = value.replace(SUBJECT_PREFIX, '');
  }

  return value.toLowerCase();
};

const continuesSubject = (previous?: string, subject?: string) =>
  normalizeSubject(previous) === normalizeSubject(subject);

const toStoredAddresses = (addresses: IInboundAddress[] = []): IMailAddress[] =>
  addresses
    .filter((entry) => Boolean(entry?.address))
    .map((entry) => ({ name: entry.name, address: entry.address as string }));

interface IInboundContext {
  models: IModels;
  subdomain: string;
  payload: IInboundMailPayload;
  sender: IInboundSender;
  scopeId: string;
  customerId: string;
  createdAt: Date;
  isAuto: boolean;
  body: string;
  attachments: IMailAttachment[];
}

const resolveConversationId = async ({
  models,
  subdomain,
  payload,
  sender,
  scopeId,
  customerId,
  createdAt,
}: IInboundContext) => {
  const tagged = sender.replyTag
    ? await models.MailMessages.findByReplyTag(scopeId, sender.replyTag)
    : null;

  if (tagged?.inboxConversationId) {
    return { conversationId: tagged.inboxConversationId, isNew: false };
  }

  const threaded = await models.MailMessages.findRelatedThread(
    scopeId,
    payload.messageId,
    payload.inReplyTo,
    payload.references,
  );

  if (threaded?.inboxConversationId) {
    return { conversationId: threaded.inboxConversationId, isNew: false };
  }

  const open = await models.Conversations.findOne({
    integrationId: scopeId,
    customerId,
    status: { $in: ['new', 'open'] },
  })
    .sort({ updatedAt: -1 })
    .lean();

  if (open) {
    const [latest] = await models.MailMessages.find({
      inboxIntegrationId: scopeId,
      inboxConversationId: String(open._id),
    })
      .sort({ createdAt: -1 })
      .limit(1);

    if (latest && continuesSubject(latest.subject, payload.subject)) {
      return { conversationId: String(open._id), isNew: false };
    }
  }

  const response = await receiveInboxMessage(subdomain, {
    action: 'create-or-update-conversation',
    payload: JSON.stringify({
      integrationId: scopeId,
      customerId,
      createdAt,
      content: payload.subject,
    }),
  });

  if (response.status !== 'success') {
    throw new Error(
      `Conversation creation failed: ${JSON.stringify(response)}`,
    );
  }

  return { conversationId: response.data._id as string, isNew: true };
};

const resolveTicketId = async (
  {
    models,
    subdomain,
    payload,
    sender,
    scopeId,
    customerId,
    isAuto,
    body,
  }: IInboundContext,
  pipelineId: string,
) => {
  const openThread = async (message: { ticketId?: string } | null) =>
    message?.ticketId && (await isTicketOpen(models, message.ticketId))
      ? message.ticketId
      : null;

  const tagged = sender.replyTag
    ? await models.MailMessages.findByReplyTag(scopeId, sender.replyTag)
    : null;

  const byTag = await openThread(tagged);

  if (byTag) {
    return byTag;
  }

  const threaded = await models.MailMessages.findRelatedThread(
    scopeId,
    payload.messageId,
    payload.inReplyTo,
    payload.references,
  );

  const byReference = await openThread(threaded);

  if (byReference) {
    return byReference;
  }

  const latest = await models.MailMessages.findLatestFromSender(
    scopeId,
    sender.address,
  );

  if (latest && continuesSubject(latest.subject, payload.subject)) {
    const bySubject = await openThread(latest);

    if (bySubject) {
      return bySubject;
    }
  }

  if (isAuto) {
    return null;
  }

  const ticket = await createTicketFromMail({
    models,
    subdomain,
    pipelineId,
    customerId,
    subject: payload.subject,
    body,
  });

  return ticket._id;
};

const storeMessage = (
  context: IInboundContext,
  thread: { inboxConversationId?: string; ticketId?: string },
) => {
  const {
    models,
    payload,
    sender,
    scopeId,
    createdAt,
    isAuto,
    body,
    attachments,
  } = context;

  return models.MailMessages.create({
    ...thread,
    inboxIntegrationId: scopeId,
    messageId: payload.messageId,
    inReplyTo: payload.inReplyTo,
    references: payload.references ?? [],
    subject: payload.subject,
    body,
    from: toStoredAddresses(payload.from ? [payload.from] : []),
    to: toStoredAddresses(payload.recipients),
    cc: toStoredAddresses(payload.cc),
    bcc: toStoredAddresses(payload.bcc),
    attachments,
    isAuto,
    envelopeFrom: sender.envelopeFrom,
    senderMismatch: sender.mismatch,
    type: MAIL_MESSAGE_TYPES.INBOX,
    createdAt,
  });
};

const storeConversationMail = async (context: IInboundContext) => {
  const { models, subdomain, createdAt, isAuto, body, attachments, payload } =
    context;

  const { conversationId, isNew } = await resolveConversationId(context);

  if (!isNew) {
    if (!isAuto) {
      await models.Conversations.reopen(conversationId);
    }

    await models.Conversations.updateConversation(conversationId, {
      content: payload.subject,
      updatedAt: createdAt,
    });
  }

  const message = await storeMessage(context, {
    inboxConversationId: conversationId,
  });

  await pConversationClientMessageInserted(subdomain, {
    _id: String(message._id),
    content: body,
    conversationId,
    createdAt,
  });

  return {
    status: 'ok',
    conversationId,
    messageId: message._id,
    isAuto,
    keepStored: hasUnstoredAttachment(attachments),
  };
};

const storeTicketMail = async (
  context: IInboundContext,
  pipelineId: string,
) => {
  const { isAuto, attachments } = context;

  const ticketId = await resolveTicketId(context, pipelineId);

  if (!ticketId) {
    return { status: 'ignored', reason: 'auto-reply' };
  }

  const message = await storeMessage(context, { ticketId });

  if (!isAuto) {
    await commentFromMail({
      models: context.models,
      subdomain: context.subdomain,
      ticketId,
      customerId: context.customerId,
      message,
    });
  }

  return {
    status: 'ok',
    ticketId,
    messageId: message._id,
    isAuto,
    keepStored: hasUnstoredAttachment(attachments),
  };
};

const storeInboundMessage = async (
  models: IModels,
  subdomain: string,
  integration: IMailIntegrationDocument,
  payload: IInboundMailPayload,
  sender: IInboundSender,
) => {
  const verification = captureForwardVerification(
    integration,
    payload,
    payload.html ?? '',
  );

  if (verification) {
    await models.MailIntegrations.storeForwardVerification(
      integration._id,
      verification,
    );

    await models.MailIntegrations.markHealthy(integration._id);

    return { status: 'ignored', reason: 'forward-verification' };
  }

  const scopeId = mailScopeId(integration);

  const attachments = await storeAttachments(subdomain, payload.attachments);

  const context: IInboundContext = {
    models,
    subdomain,
    payload,
    sender,
    scopeId,
    createdAt: resolveReceivedAt(payload.receivedAt),
    isAuto: isAutomatedMessage(payload.headers),
    attachments,
    body: resolveInlineImages(payload.html ?? '', attachments),
    customerId: await models.MailCustomers.findOrCreate(
      subdomain,
      sender.address,
      scopeId,
      payload.from?.name,
    ),
  };

  const { pipelineId } = integration;

  const result = pipelineId
    ? await storeTicketMail(context, pipelineId)
    : await storeConversationMail(context);

  await models.MailIntegrations.markHealthy(integration._id);

  return result;
};

export const receiveMailMessage = async (req: Request, res: Response) => {
  const subdomain = getSubdomain(req);
  const rawBody =
    (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.alloc(0);

  const { keys, reason } = await resolveInboundKeys(subdomain);

  const verified = verifySignature(
    keys,
    rawBody,
    req.header(MAIL_SIGNATURE_HEADER),
    req.header(MAIL_TIMESTAMP_HEADER),
  );

  if (!verified.ok) {
    return res.status(401).json({ error: reason ?? verified.error });
  }

  const payload = req.body as IInboundMailPayload;

  if (payload?.probe) {
    return res.json({ status: 'ok', probe: true });
  }

  if (!payload?.messageId || !payload?.to) {
    return res.status(400).json({ error: 'messageId and to are required' });
  }

  const models = await generateModels(subdomain);

  await ensureMailIndexes(models, subdomain);

  const { address, tag } = parseTaggedAddress(payload.to);

  const integration = await models.MailIntegrations.findOne({
    address,
    disabledAt: null,
  });

  if (!integration) {
    return res.status(404).json({ error: `Unknown address ${payload.to}` });
  }

  const scopeId = mailScopeId(integration);

  const rate = await checkInboundRate(subdomain, scopeId);

  if (!rate.allowed) {
    return res
      .status(429)
      .set('retry-after', String(rate.retryAfter))
      .json({ error: 'Too many inbound messages for this inbox' });
  }

  const duplicate = await models.MailMessages.findOne({
    inboxIntegrationId: scopeId,
    messageId: payload.messageId,
  });

  if (duplicate) {
    return res.json({ status: 'duplicate' });
  }

  const headerFrom = normalizeAddress(payload.from?.address);
  const envelopeFrom = normalizeAddress(payload.envelopeFrom);
  const senderAddress = headerFrom || envelopeFrom;

  if (!senderAddress) {
    return res.status(400).json({ error: 'from.address is required' });
  }

  const selfAddress = normalizeAddress(integration.address);

  const claimsSelf = [senderAddress, envelopeFrom].some(
    (entry) => entry && parseTaggedAddress(entry).address === selfAddress,
  );

  if (selfAddress && claimsSelf) {
    return res.json({ status: 'ignored', reason: 'self-addressed' });
  }

  try {
    const result = await storeInboundMessage(
      models,
      subdomain,
      integration,
      payload,
      {
        address: senderAddress,
        envelopeFrom: envelopeFrom || undefined,
        mismatch: isSenderMismatch(
          integration,
          headerFrom,
          envelopeFrom,
          readDeliveredTo(payload.headers),
        ),
        replyTag: tag,
      },
    );

    return res.json(result);
  } catch (e) {
    if (isDuplicateKeyError(e, 'messageId')) {
      return res.json({ status: 'duplicate' });
    }

    await models.MailIntegrations.markUnhealthy(
      integration._id,
      describeError(e),
    );

    throw e;
  }
};
