import { debugError } from '@/integrations/facebook/debuggers';
import {
  TAutomationActionConfig,
  TBotMessageInputData,
} from '@/integrations/facebook/meta/automation/types/automationTypes';
import { sendAutomationTrigger } from 'erxes-api-shared/core-modules';
import {
  createMQWorkerWithListeners,
  redis,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { Job } from 'bullmq';
import { generateModels, IModels } from '~/connectionResolvers';

export const FACEBOOK_INPUT_TIMEOUT_QUEUE = 'facebookInputTimeout';

// Must match the "If Not Reply" handle id the action node renders.
const NO_REPLY_CONNECT_ID = 'ifNotReply';

const UNIT_MS: Record<TBotMessageInputData['type'], number> = {
  minute: 60e3,
  hour: 3600e3,
  day: 24 * 3600e3,
  month: 30 * 24 * 3600e3,
  year: 365 * 24 * 3600e3,
};

type TInputTimeoutJob = {
  subdomain: string;
  conversationId: string;
  executionId: string;
  actionId: string;
};

/**
 * Starts waiting for the person's next typed message. A typed reply carries no
 * payload, so the step is resumed from this record instead of a button id.
 */
export const startFacebookInputWait = async (
  models: IModels,
  subdomain: string,
  {
    conversationId,
    executionId,
    actionId,
    botId,
    input,
    optionalConnects = [],
  }: {
    conversationId: string;
    executionId: string;
    actionId: string;
    botId: string;
    input: TBotMessageInputData;
    optionalConnects?: TAutomationActionConfig['optionalConnects'];
  },
) => {
  const isConnected = (connectId: string) =>
    optionalConnects.some(
      ({ optionalConnectId, actionId: nextActionId }) =>
        optionalConnectId === connectId && !!nextActionId,
    );

  const hasReplyConnect = isConnected(botId);
  const hasNoReplyConnect = isConnected(NO_REPLY_CONNECT_ID);

  if (!hasReplyConnect && !hasNoReplyConnect) {
    return;
  }

  const delay = Math.max(1, Number(input.value) || 1) * UNIT_MS[input.type];

  await models.FacebookConversations.updateOne(
    { _id: conversationId },
    {
      $set: {
        inputWait: {
          executionId,
          actionId,
          replyConnectId: hasReplyConnect ? botId : undefined,
          expiresAt: new Date(Date.now() + delay),
        },
      },
    },
  );

  if (hasNoReplyConnect) {
    await sendWorkerQueue('frontline', FACEBOOK_INPUT_TIMEOUT_QUEUE).add(
      'inputTimeout',
      { subdomain, conversationId, executionId, actionId },
      { delay, removeOnComplete: true, removeOnFail: 50 },
    );
  }
};

/**
 * Takes the pending input wait for a typed message, at most once. Returns the
 * repeat options that resume the step's "If Reply" branch, if it has one.
 */
export const claimFacebookInputReply = async (
  models: IModels,
  conversationId?: string,
) => {
  if (!conversationId) {
    return undefined;
  }

  const conversation = await models.FacebookConversations.findOneAndUpdate(
    { _id: conversationId, 'inputWait.expiresAt': { $gt: new Date() } },
    { $unset: { inputWait: 1 } },
    { projection: { inputWait: 1 } },
  ).lean();

  const { executionId, actionId, replyConnectId } =
    conversation?.inputWait || {};

  if (!executionId || !actionId || !replyConnectId) {
    return undefined;
  }

  return { executionId, actionId, optionalConnectId: replyConnectId };
};

export const startFacebookInputTimeoutWorker = () =>
  createMQWorkerWithListeners(
    'frontline',
    FACEBOOK_INPUT_TIMEOUT_QUEUE,
    async (job: Job<TInputTimeoutJob>) => {
      const { subdomain, conversationId, executionId, actionId } =
        job.data || {};

      if (!subdomain || !conversationId || !executionId || !actionId) {
        debugError(`Input timeout job ${job.id} is missing its target`);
        return;
      }

      const models = await generateModels(subdomain);

      // Gone means the person replied, or a newer input step replaced this one.
      const claimed = await models.FacebookConversations.findOneAndUpdate(
        {
          _id: conversationId,
          'inputWait.executionId': executionId,
          'inputWait.actionId': actionId,
        },
        { $unset: { inputWait: 1 } },
      );

      if (!claimed) {
        return;
      }

      sendAutomationTrigger(
        subdomain,
        {
          type: 'frontline:facebook.messages',
          targets: [],
          repeatOptions: {
            executionId,
            actionId,
            optionalConnectId: NO_REPLY_CONNECT_ID,
          },
        },
        { transport: 'trpc' },
      );
    },
    redis,
    () => undefined,
  );
