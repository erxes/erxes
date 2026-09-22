import { reserveSendSlot } from '@/integrations/facebook/commentGuard';
import { generateAttachmentUrl } from '@/integrations/facebook/commonUtils';
import { debugError } from '@/integrations/facebook/debuggers';
import { isSendThrottledError } from '@/integrations/facebook/errors';
import { sendReply } from '@/integrations/facebook/utils';
import { sendAutomationDeferredCompletion } from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { randomUUID } from 'node:crypto';
import { IModels } from '~/connectionResolvers';

export const FACEBOOK_COMMENT_OUTBOX_QUEUE = 'facebookCommentOutbox';

/**
 * A reply that has waited this long has outlived the comment it answers, and
 * keeping it queued would let a permanently blocked page grow an unbounded
 * backlog. Measured enforcement windows ran 2 to 8.4 hours, so a day of
 * patience clears every one of them with room to spare.
 */
const MAX_QUEUE_AGE_MS = 24 * 3600e3;

type TQueueReplyInput = {
  executionId: string;
  actionId: string;
  pageId: string;
  postId?: string;
  commentId: string;
  senderId: string;
  integrationId?: string;
  text: string;
  attachments?: any[];
  mentionSender?: boolean;
};

/**
 * Records the reply and schedules it for its slot. The automation is told the
 * work is queued and carries on, so the private reply after it is not delayed.
 */
export const queueCommentReply = async (
  models: IModels,
  subdomain: string,
  input: TQueueReplyInput,
) => {
  if (!input.integrationId) {
    throw new Error('integrationId is required');
  }

  const jobId = randomUUID();
  const delay = await reserveSendSlot(models, subdomain, input.pageId);

  const outbox = await models.FacebookCommentOutbox.create({
    ...input,
    jobId,
    status: 'pending',
    sendAfter: new Date(Date.now() + delay),
  });

  await scheduleSend(subdomain, outbox._id, delay);

  return { jobId, delay };
};

const scheduleSend = (subdomain: string, outboxId: string, delay: number) =>
  sendWorkerQueue('frontline', FACEBOOK_COMMENT_OUTBOX_QUEUE).add(
    'sendCommentReply',
    { subdomain, outboxId },
    { delay, removeOnComplete: true, removeOnFail: 50 },
  );

/**
 * Sends one queued reply and reports the deferred action back. A refusal opens
 * the page breaker so the rest of the queue stops rather than repeating it.
 */
export const drainCommentReply = async (
  models: IModels,
  subdomain: string,
  outboxId: string,
) => {
  const outbox = await models.FacebookCommentOutbox.findOne({
    _id: outboxId,
    status: 'pending',
  });

  if (!outbox) {
    // Already sent, or dropped with the execution; nothing to report.
    return;
  }

  const age = Date.now() - new Date(outbox.createdAt).getTime();

  if (age > MAX_QUEUE_AGE_MS) {
    await models.FacebookCommentOutbox.markFailed(
      outbox._id,
      'Gave up after a day of waiting for public replies to reopen',
    );

    return completion(subdomain, outbox, 'error', {
      status: 'skipped',
      reason: 'queue-expired',
    });
  }

  const blocked = await models.FacebookBots.getSendBlock(outbox.pageId);

  if (blocked) {
    // The window lifts on its own and the reply is still worth sending, so it
    // waits rather than being buried. A fresh pacing slot is taken on top of
    // the wait: without one the whole backlog would wake at the same instant
    // and repeat the burst that got the page blocked.
    const wait = Math.max(blocked.until.getTime() - Date.now(), 0);
    const slot = await reserveSendSlot(models, subdomain, outbox.pageId);
    const delay = wait + slot;

    await models.FacebookCommentOutbox.markRequeued(
      outbox._id,
      new Date(Date.now() + delay),
    );

    return scheduleSend(subdomain, outbox._id, delay);
  }

  // The mention tags the commenter publicly under the post, so it goes out
  // only when the automation asked for it.
  const data: any = {
    message: outbox.mentionSender
      ? `@[${outbox.senderId}] ${outbox.text}`
      : outbox.text,
  };
  const [attachment] = outbox.attachments || [];

  if (attachment?.url) {
    // The form stores the upload's key, and Facebook fetches the image itself,
    // so it has to be handed a reachable address.
    data.attachment_url = generateAttachmentUrl(subdomain, attachment.url);
  }

  try {
    await sendReply(
      models,
      `${outbox.commentId}/comments`,
      data,
      outbox.pageId,
      outbox.integrationId,
    );

    await models.FacebookCommentConversationReply.create({
      recipientId: outbox.pageId,
      senderId: outbox.senderId,
      attachments: outbox.attachments,
      createdAt: new Date(),
      content: outbox.text,
      parentId: outbox.commentId,
    });

    await models.FacebookCommentOutbox.markSent(outbox._id);
    await models.FacebookBots.closeSendBreaker(outbox.pageId);

    return completion(subdomain, outbox, 'success', {
      status: 'success',
      text: outbox.text,
    });
  } catch (error) {
    debugError(error.message);

    const opened = isSendThrottledError(error)
      ? await models.FacebookBots.openSendBreaker(outbox.pageId, error.message)
      : null;

    if (opened) {
      // This reply is the one Facebook refused, so it waits out the window it
      // just opened rather than being the single send thrown away.
      const wait = Math.max(opened.until.getTime() - Date.now(), 0);
      const slot = await reserveSendSlot(models, subdomain, outbox.pageId);
      const delay = wait + slot;

      await models.FacebookCommentOutbox.markRequeued(
        outbox._id,
        new Date(Date.now() + delay),
      );

      return scheduleSend(subdomain, outbox._id, delay);
    }

    await models.FacebookCommentOutbox.markFailed(outbox._id, error.message);

    return completion(subdomain, outbox, 'error', { error: error.message });
  }
};

const completion = async (
  subdomain: string,
  outbox: { executionId: string; actionId: string; jobId: string },
  status: 'success' | 'error',
  result: any,
) => {
  try {
    await sendAutomationDeferredCompletion(subdomain, {
      executionId: outbox.executionId,
      actionId: outbox.actionId,
      jobId: outbox.jobId,
      status,
      result,
    });
  } catch (e) {
    // The reply already went out; the execution will time out on its own.
    debugError(`Deferred completion failed for ${outbox.jobId}: ${e.message}`);
  }
};
