import { getEnv } from '@erxes/api-utils/src';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

import { sendToGrandStream } from '../utils';
import { generateModels } from '../connectionResolver';
import redis from '../redlock';

function arraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

async function processQueueState(
  queue: string,
  state: 'waiting' | 'talking' | 'agent',
  newData: any,
  pubsubEvent: string,
  comparisonKey?: 'callerid' | 'member',
) {
  if (!newData) {
    return;
  }

  const redisKey = `callRealtimeHistory:${queue}:${state}`;
  const oldHistoryJSON = await redis.get(redisKey);

  if (!oldHistoryJSON) {
    await redis.set(redisKey, JSON.stringify(newData));
    return;
  }
  const oldHistory = JSON.parse(oldHistoryJSON);
  let hasChanged = false;

  if (comparisonKey === 'callerid') {
    const oldIds = (oldHistory.member || [])
      .map((item) => item.callerid)
      .sort();
    const newIds = (newData.member || []).map((item) => item.callerid).sort();
    if (!arraysEqual(oldIds, newIds)) {
      hasChanged = true;
    }
  } else if (comparisonKey === 'member') {
    if (
      JSON.stringify(oldHistory.member || []) !==
      JSON.stringify(newData.member || [])
    ) {
      hasChanged = true;
    }
  }

  await redis.set(redisKey, JSON.stringify(newData));

  const updatedHistory = await redis.get(redisKey);

  graphqlPubsub.publish(pubsubEvent, {
    [pubsubEvent]: JSON.parse(JSON.stringify(updatedHistory) || '{}'),
  });
}

export default {
  handle3SecondlyJob: async ({ subdomain }: { subdomain: string }) => {
    if (
      getEnv({ name: 'VERSION' }) !== 'os' ||
      !getEnv({ name: 'CALL_CRON_ENABLED' })
    ) {
      return;
    }
    console.log('call cron running ...');
    const models = await generateModels(subdomain);
    const integrations = await models.Integrations.find({
      'queues.0': { $exists: true },
    }).lean();

    for (const integration of integrations) {
      if (!integration.queues) continue;

      for (const queue of integration.queues) {
        const baseGrandStreamArgs = {
          method: 'POST' as const,
          headers: { 'Content-Type': 'application/json' },
          integrationId: integration.inboxId,
          isConvertToJson: true,
          isCronRunning: true,
        };

        try {
          const waitingData = await sendToGrandStream(
            models,
            {
              ...baseGrandStreamArgs,
              path: 'api',
              data: {
                request: { action: 'getQueueCalling', extension: queue },
              },
            },
            {},
          );
          await processQueueState(
            queue.toString(),
            'waiting',
            waitingData?.response?.CallQueues,
            'waitingCallReceived',
            'callerid',
          );

          const talkingData = await sendToGrandStream(
            models,
            {
              ...baseGrandStreamArgs,
              path: 'api',
              data: {
                request: {
                  action: 'getQueueCalling',
                  extension: queue,
                  role: 'answer',
                },
              },
            },
            {},
          );
          await processQueueState(
            queue.toString(),
            'talking',
            talkingData?.response?.CallQueues,
            'talkingCallReceived',
            'callerid',
          );

          const agentData = await sendToGrandStream(
            models,
            {
              ...baseGrandStreamArgs,
              path: 'api',
              data: {
                request: {
                  action: 'getCallQueuesMemberMessage',
                  extension: queue,
                },
              },
            },
            {},
          );
          await processQueueState(
            queue.toString(),
            'agent',
            agentData?.response?.CallQueueMembersMessage,
            'agentCallReceived',
            'member',
          );
        } catch (error) {
          console.error(
            `[cron] Failed to process queue ${queue} for integration ${integration.inboxId}:`,
            error.message,
          );
        }
      }
    }
  },
};
