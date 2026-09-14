import { createHash } from 'node:crypto';
import type { IContext } from '~/connectionResolvers';
import type {
  IViberOutbox,
  IViberSendPart,
} from '@/integrations/viber/@types/transport';
import { assertViberConversationAccess } from '@/integrations/viber/access';
import {
  buildViberSendParts,
  sendViberMessage,
} from '@/integrations/viber/utils/send';
import { formatViberText } from '@/integrations/viber/utils/content';
import {
  getViberOutboundMediaUrl,
  readViberStoredAttachment,
} from '@/integrations/viber/utils/outboundMedia';
import { publishViberDelivery } from '@/integrations/viber/events';

export interface IViberReplyInput {
  conversationId: string;
  content?: string;
  attachments?: unknown;
  structured?: unknown;
  replyToMessageId?: string;
  poll?: unknown;
  requestId?: string;
}

const loadViberRecipient = async (
  context: IContext,
  conversationId: string,
) => {
  const { conversation, integration } = await assertViberConversationAccess(
    context,
    conversationId,
    'conversationMessageAdd',
  );
  if (integration.isActive === false) {
    throw new Error(
      'This Viber integration is archived. Restore it before replying.',
    );
  }
  const mapping = await context.models.ViberConversations.findOne({
    inboxId: integration._id,
    conversationId,
  });
  if (!mapping) throw new Error('Viber recipient mapping not found');
  const customer = await context.models.ViberCustomers.findOne({
    inboxId: integration._id,
    userId: mapping.userId,
    contactsId: conversation.customerId,
  });
  if (!customer)
    throw new Error('Viber customer mapping does not match this conversation');
  const subscription = await context.models.ViberSubscriptions.findOne({
    inboxId: integration._id,
    userId: mapping.userId,
  });
  if (subscription?.subscribed === false)
    throw new Error(
      'This customer has unsubscribed from Viber. Wait for them to subscribe or message the bot again.',
    );
  const connection = await context.models.ViberIntegrations.findOne({
    inboxId: integration._id,
  }).select('+token');
  if (!connection) throw new Error('Viber connection not found');
  return { connection, mapping };
};

const saveOutboxProgress = async (
  context: IContext,
  outbox: IViberOutbox,
): Promise<void> => {
  try {
    const result = await context.models.ViberOutbox.updateOne(
      { _id: outbox._id, inboxId: outbox.inboxId, state: 'sending' },
      {
        $set: {
          parts: outbox.parts,
          state: outbox.state,
          updatedAt: new Date(),
        },
      },
      { runValidators: true },
    );
    if (result.matchedCount !== 1) throw new Error('Unmatched send record');
  } catch {
    throw new Error(
      `Viber send state could not be saved. Do not resend before checking delivery. Saved inbox message: ${outbox._id}`,
    );
  }
};

export const dispatchViberOutbox = async (
  context: IContext,
  messageId: string,
): Promise<void> => {
  if (!context.user?._id) throw new Error('Authentication required');
  await context.checkPermission('conversationMessageAdd');
  const { models, subdomain } = context;
  const existing = await models.ViberOutbox.findOne({ _id: messageId });
  if (!existing) throw new Error('Viber outgoing message not found');
  const { connection, mapping } = await loadViberRecipient(
    context,
    existing.conversationId,
  );
  if (
    existing.inboxId !== connection.inboxId ||
    existing.userId !== mapping.userId
  )
    throw new Error('Viber outgoing message owner does not match');
  const native = await models.ConversationMessages.findOne({
    _id: messageId,
    conversationId: existing.conversationId,
    userId: existing.agentId,
  });
  if (!native || native.internal)
    throw new Error('Viber outgoing inbox message not found');
  // Claim the whole reply, not individual parts, to preserve multipart ordering.
  const outbox = await models.ViberOutbox.findOneAndUpdate(
    {
      _id: messageId,
      inboxId: existing.inboxId,
      state: { $in: ['pending', 'rejected'] },
    },
    { $set: { state: 'sending', updatedAt: new Date() } },
    { new: true, runValidators: true },
  ).lean();
  if (!outbox)
    throw new Error(
      'This Viber reply is already sent, sending, or unconfirmed. It cannot be automatically retried.',
    );
  for (let index = 0; index < outbox.parts.length; index += 1) {
    const part = outbox.parts[index];
    if (part.state === 'sent') continue;
    if (!['pending', 'rejected'].includes(part.state))
      throw new Error(
        'Viber reply contains an unconfirmed part. Do not resend.',
      );
    // Preflight errors are safe to retry: no provider call has happened yet.
    try {
      if (part.attachment) {
        await readViberStoredAttachment(subdomain, part.attachment);
        if ('media' in part.body) {
          part.body.media = getViberOutboundMediaUrl(
            subdomain,
            outbox.inboxId,
            connection.token,
            outbox._id,
            index,
            part.attachment.name,
          );
        }
      }
    } catch {
      part.state = 'rejected';
      part.error =
        'Viber attachment could not be prepared. Check storage, filename, size, and callback URL before retrying.';
      outbox.state = 'rejected';
      await saveOutboxProgress(context, outbox);
      await publishViberDelivery(models, subdomain, messageId);
      throw new Error(part.error);
    }
    part.state = 'sending';
    part.error = undefined;
    await saveOutboxProgress(context, outbox);
    let result: Awaited<ReturnType<typeof sendViberMessage>>;
    try {
      result = await sendViberMessage(
        connection.token,
        outbox.userId,
        connection.name || 'Viber',
        part.body,
      );
    } catch {
      // Local input checks throw before fetch; fetch/parse uncertainty returns unknown.
      result = {
        state: 'rejected',
        error:
          'Viber reply configuration is invalid. Check the token and message size.',
      };
    }
    part.state = result.state;
    if (result.state === 'sent') part.messageToken = result.messageToken;
    else part.error = result.error;
    outbox.state = result.state === 'sent' ? 'sending' : result.state;
    await saveOutboxProgress(context, outbox);
    if (result.state !== 'sent') {
      await publishViberDelivery(models, subdomain, messageId);
      throw new Error(`${result.error} Saved inbox message: ${messageId}`);
    }
  }
  outbox.state = 'sent';
  await saveOutboxProgress(context, outbox);
  // Also reconciles callbacks that arrived before the send response was saved.
  try {
    await publishViberDelivery(models, subdomain, messageId);
  } catch {
    throw new Error(
      `Viber accepted this reply, but its inbox update could not be confirmed. Do not resend. Saved inbox message: ${messageId}`,
    );
  }
};

export const sendViberReply = async (
  context: IContext,
  input: IViberReplyInput,
) => {
  if (input.poll || input.replyToMessageId)
    throw new Error(
      'Viber does not support Frontline polls or quoted replies through this API. Send a normal reply instead.',
    );
  const { connection, mapping } = await loadViberRecipient(
    context,
    input.conversationId,
  );
  const plan = buildViberSendParts(
    input.content ?? '',
    input.attachments ?? [],
    input.structured,
  );
  const attachments = plan.parts.flatMap((part) =>
    part.attachment ? [part.attachment] : [],
  );
  if (input.requestId && !/^[a-zA-Z0-9_-]{16,128}$/.test(input.requestId)) {
    throw new Error('Invalid Viber send request ID');
  }
  const requestHash = createHash('sha256')
    .update(JSON.stringify(plan))
    .digest('hex');
  const messageId = input.requestId
    ? `viber-${createHash('sha256')
        .update(
          JSON.stringify([
            context.user._id,
            input.conversationId,
            input.requestId,
          ]),
        )
        .digest('hex')}`
    : undefined;
  const findPrevious = async () => {
    if (!messageId) return null;
    const previous = await context.models.ConversationMessages.findOne({
      _id: messageId,
      conversationId: input.conversationId,
      userId: context.user._id,
    });
    const marker = previous?.extraData?.viber;
    if (
      previous &&
      (!marker ||
        typeof marker !== 'object' ||
        !('requestHash' in marker) ||
        marker.requestHash !== requestHash)
    ) {
      throw new Error(
        'This Viber request ID was already used for a different reply. Check the saved message before sending again.',
      );
    }
    return previous;
  };
  const previous = await findPrevious();
  if (previous) return previous;
  // Follow Frontline's native message lifecycle; provider I/O starts only after persistence.
  const document = {
    ...(messageId ? { _id: messageId } : {}),
    conversationId: input.conversationId,
    content: formatViberText(plan.content),
    attachments,
    extraData: { viber: { state: 'pending', requestHash } },
  };
  const message = await context.models.ConversationMessages.addMessage(
    document,
    context.user._id,
  ).catch(async (error: unknown) => {
    // A concurrent request or a lost database acknowledgement must not send twice.
    const existing = await findPrevious();
    if (existing) return existing;
    throw error;
  });
  if (
    messageId &&
    (await context.models.ViberOutbox.findOne({ _id: messageId }))
  ) {
    return context.models.ConversationMessages.getMessage(messageId);
  }
  try {
    await context.models.ViberOutbox.create({
      _id: message._id,
      inboxId: connection.inboxId,
      conversationId: input.conversationId,
      userId: mapping.userId,
      agentId: context.user._id,
      state: 'pending',
      parts: plan.parts,
    });
  } catch {
    if (input.requestId)
      return context.models.ConversationMessages.getMessage(message._id);
    throw new Error(
      `Viber reply was not dispatched because its send record could not be confirmed. Check saved inbox message ${message._id} before retrying.`,
    );
  }
  try {
    await dispatchViberOutbox(context, message._id);
  } catch (error) {
    // The UI receives the saved message and its delivery state, not a misleading
    // "unsaved draft" error that encourages sending a second copy.
    if (!input.requestId) throw error;
  }
  return context.models.ConversationMessages.getMessage(message._id);
};

export const getViberMessageStatus = async (
  context: IContext,
  messageId: string,
) => {
  if (!context.user?._id) throw new Error('Authentication required');
  await context.checkPermission('showConversations');
  const outbox = await context.models.ViberOutbox.findOne({ _id: messageId });
  if (!outbox) {
    const native = await context.models.ConversationMessages.findOne({
      _id: messageId,
    });
    if (!native?.extraData?.viber || native.internal) return null;
    await assertViberConversationAccess(
      context,
      native.conversationId,
      'showConversations',
    );
    return {
      _id: messageId,
      state: 'unknown',
      error:
        'The send record is unavailable. Do not resend until an administrator checks this saved message.',
      parts: [],
    };
  }
  await assertViberConversationAccess(
    context,
    outbox.conversationId,
    'showConversations',
  );
  const receipts = await context.models.ViberReceipts.find({
    inboxId: outbox.inboxId,
    userId: outbox.userId,
    messageToken: {
      $in: outbox.parts.flatMap((part) =>
        part.messageToken ? [part.messageToken] : [],
      ),
    },
  });
  const byToken = new Map(
    receipts.map((receipt) => [receipt.messageToken, receipt]),
  );
  return {
    _id: outbox._id,
    state:
      outbox.state === 'sending' &&
      Date.now() - outbox.updatedAt.getTime() > 60_000
        ? 'unknown'
        : outbox.state,
    parts: outbox.parts.map((part: IViberSendPart, index) => {
      const receipt = part.messageToken
        ? byToken.get(part.messageToken)
        : undefined;
      return {
        index,
        type: part.body.type,
        state: part.state,
        messageToken: part.messageToken,
        error:
          part.error ||
          (receipt?.failedAt
            ? 'Viber reported a client-side delivery failure.'
            : null),
        deliveredAt: receipt?.deliveredAt,
        seenAt: receipt?.seenAt,
        failedAt: receipt?.failedAt,
      };
    }),
  };
};
