import { reserveSendSlot } from '@/integrations/facebook/commentGuard';
import { debugError } from '@/integrations/facebook/debuggers';
import { isSendThrottledError } from '@/integrations/facebook/errors';
import { sendReply } from '@/integrations/facebook/utils';
import { sendAutomationDeferredCompletion } from 'erxes-api-shared/core-modules';
import { sendWorkerQueue } from 'erxes-api-shared/utils';
import { randomUUID } from 'node:crypto';
import { IModels } from '~/connectionResolvers';

export const FACEBOOK_COMMENT_OUTBOX_QUEUE = 'facebookCommentOutbox';

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

  await sendWorkerQueue('frontline', FACEBOOK_COMMENT_OUTBOX_QUEUE).add(
    'sendCommentReply',
    { subdomain, outboxId: outbox._id },
    { delay, removeOnComplete: true, removeOnFail: 50 },
  );

  return { jobId, delay };
};

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

  const blocked = await models.FacebookBots.getSendBlock(outbox.pageId);

  if (blocked) {
    await models.FacebookCommentOutbox.markFailed(
      outbox._id,
      `Public replies paused until ${blocked.until.toISOString()}`,
    );

    return completion(subdomain, outbox, 'error', {
      status: 'skipped',
      reason: 'send-blocked',
      blockedUntil: blocked.until,
      blockReason: blocked.reason,
    });
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
    data.attachment_url = attachment.url;
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

    if (isSendThrottledError(error)) {
      await models.FacebookBots.openSendBreaker(outbox.pageId, error.message);
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
