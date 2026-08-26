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
import { IMailAddress } from '@/integrations/mail/@types/message';
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
import { describeError } from '@/integrations/mail/utils/errors';
import { verifySignature } from '@/integrations/mail/utils/signature';
import { resolveInboundKeys } from '@/integrations/mail/utils/inboundKeys';

const SUBJECT_PREFIX =
  /^(?:\s*(?:re|fwd?|aw|antw|sv|vs)(?:\s*\[\d+\])?\s*:)+\s*/i;

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

const isForwardedBy = (
  integration: IMailIntegrationDocument,
  envelopeFrom: string,
) => {
  const forwardFrom = normalizeAddress(integration.forwardFrom);

  if (!forwardFrom) {
    return false;
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
) =>
  Boolean(
    headerFrom &&
      envelopeFrom &&
      parseTaggedAddress(envelopeFrom).address !==
        parseTaggedAddress(headerFrom).address &&
      !isForwardedBy(integration, envelopeFrom),
  );

const normalizeSubject = (subject?: string) =>
  (subject || '').replace(SUBJECT_PREFIX, '').trim().toLowerCase();

const continuesSubject = async (
  models: IModels,
  inboxIntegrationId: string,
  conversationId: string,
  subject?: string,
) => {
  const [latest] = await models.MailMessages.find({
    inboxIntegrationId,
    inboxConversationId: conversationId,
  })
    .sort({ createdAt: -1 })
    .limit(1);

  return latest
    ? normalizeSubject(latest.subject) === normalizeSubject(subject)
    : false;
};

const toStoredAddresses = (addresses: IInboundAddress[] = []): IMailAddress[] =>
  addresses
    .filter((entry) => Boolean(entry?.address))
    .map((entry) => ({ name: entry.name, address: entry.address as string }));

const resolveConversationId = async (
  models: IModels,
  subdomain: string,
  integration: IMailIntegrationDocument,
  payload: IInboundMailPayload,
  customerId: string,
  createdAt: Date,
  replyTag?: string,
) => {
  const tagged = replyTag
    ? await models.MailMessages.findConversationByReplyTag(
        integration.inboxId,
        replyTag,
      )
    : null;

  if (tagged) {
    return { conversationId: tagged, isNew: false };
  }

  const threaded = await models.MailMessages.findRelatedConversation(
    integration.inboxId,
    payload.messageId,
    payload.inReplyTo,
    payload.references,
  );

  if (threaded) {
    return { conversationId: threaded, isNew: false };
  }

  const open = await models.Conversations.findOne({
    integrationId: integration.inboxId,
    customerId,
    status: { $in: ['new', 'open'] },
  })
    .sort({ updatedAt: -1 })
    .lean();

  if (
    open &&
    (await continuesSubject(
      models,
      integration.inboxId,
      String(open._id),
      payload.subject,
    ))
  ) {
    return { conversationId: String(open._id), isNew: false };
  }

  const response = await receiveInboxMessage(subdomain, {
    action: 'create-or-update-conversation',
    payload: JSON.stringify({
      integrationId: integration.inboxId,
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

const storeInboundMessage = async (
  models: IModels,
  subdomain: string,
  integration: IMailIntegrationDocument,
  payload: IInboundMailPayload,
  sender: IInboundSender,
) => {
  const createdAt = resolveReceivedAt(payload.receivedAt);

  const isAuto = isAutomatedMessage(payload.headers);

  const customerId = await models.MailCustomers.findOrCreate(
    subdomain,
    sender.address,
    integration.inboxId,
    payload.from?.name,
  );

  const { conversationId, isNew } = await resolveConversationId(
    models,
    subdomain,
    integration,
    payload,
    customerId,
    createdAt,
    sender.replyTag,
  );

  if (!isNew) {
    if (!isAuto) {
      await models.Conversations.reopen(conversationId);
    }

    await models.Conversations.updateConversation(conversationId, {
      content: payload.subject,
      updatedAt: createdAt,
    });
  }

  const attachments = await storeAttachments(subdomain, payload.attachments);
  const body = resolveInlineImages(payload.html ?? '', attachments);

  const message = await models.MailMessages.create({
    inboxIntegrationId: integration.inboxId,
    inboxConversationId: conversationId,
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

  await pConversationClientMessageInserted(subdomain, {
    _id: String(message._id),
    content: body,
    conversationId,
    createdAt,
  });

  await models.MailIntegrations.markHealthy(integration._id);

  return {
    status: 'ok',
    conversationId,
    messageId: message._id,
    isAuto,
    keepStored: hasUnstoredAttachment(attachments),
  };
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

  const integration = await models.MailIntegrations.findOne({ address });

  if (!integration) {
    return res.status(404).json({ error: `Unknown address ${payload.to}` });
  }

  const rate = await checkInboundRate(subdomain, integration.inboxId);

  if (!rate.allowed) {
    return res
      .status(429)
      .set('retry-after', String(rate.retryAfter))
      .json({ error: 'Too many inbound messages for this inbox' });
  }

  const duplicate = await models.MailMessages.findOne({
    inboxIntegrationId: integration.inboxId,
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

  const selfAddresses = [
    normalizeAddress(integration.address),
    normalizeAddress(integration.sendingAddress),
  ].filter(Boolean);

  const claimed = [senderAddress, envelopeFrom]
    .filter(Boolean)
    .map((entry) => parseTaggedAddress(entry).address);

  if (claimed.some((entry) => selfAddresses.includes(entry))) {
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
        mismatch: isSenderMismatch(integration, headerFrom, envelopeFrom),
        replyTag: tag,
      },
    );

    return res.json(result);
  } catch (e) {
    if (isDuplicateKeyError(e, 'messageId')) {
      return res.json({ status: 'duplicate' });
    }

    await models.MailIntegrations.markUnhealthy(integration._id, describeError(e));

    throw e;
  }
};
