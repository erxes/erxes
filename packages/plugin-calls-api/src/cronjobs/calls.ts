import { getEnv } from '@erxes/api-utils/src';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

import {
  getPureDate,
  getRecordUrl,
  saveCdrData,
  sendToGrandStream,
} from '../utils';
import { generateModels } from '../connectionResolver';
import redis from '../redlock';
import { getOrganizations } from '@erxes/api-utils/src/saas/saas';
import * as momentTz from 'moment-timezone';

function arraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

export default {
  handle3SecondlyJob: async ({ subdomain }) => {
    const VERSION = getEnv({ name: 'VERSION' });

    if (VERSION && VERSION === 'os') {
      const models = await generateModels(subdomain);
      const integrations = await models.Integrations.find({}).lean();

      for (const integration of integrations) {
        if (integration.queues) {
          for (const queue of integration.queues) {
            const queueData = (await sendToGrandStream(
              models,
              {
                path: 'api',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: {
                  request: {
                    action: 'getQueueCalling',
                    extension: queue,
                  },
                },
                integrationId: integration.inboxId,
                retryCount: 1,
                isConvertToJson: true,
                isAddExtention: false,
              },
              {},
            )) as any;
            if (queueData && queueData.response) {
              const { CallQueues } = queueData?.response;

              if (CallQueues) {
                const redisKey = `callRealtimeHistory:${queue}:waiting`;
                const oldHistory = await redis.get(redisKey);

                if (!oldHistory) {
                  await redis.set(redisKey, JSON.stringify(CallQueues));
                } else {
                  const oldHistoryParsed = JSON.parse(oldHistory);
                  const oldCallerIds = oldHistoryParsed?.member
                    ?.map((item) => item.callerid)
                    .sort();
                  const newCallerIds = CallQueues.member
                    ?.map((item) => item.callerid)
                    .sort();
                  if (!arraysEqual(oldCallerIds, newCallerIds)) {
                    await redis.set(
                      redisKey,
                      JSON.stringify({
                        ...CallQueues,
                        member: CallQueues.member,
                      }),
                    );

                    const waitingKey = `callRealtimeHistory:${queue}:waiting`;
                    const history = (await redis.get(waitingKey)) || [];

                    graphqlPubsub.publish(`waitingCallReceived`, {
                      waitingCallReceived: JSON.parse(JSON.stringify(history)),
                    });
                  }
                }
              }
            }

            const queueProceedingData = (await sendToGrandStream(
              models,
              {
                path: 'api',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: {
                  request: {
                    action: 'getQueueCalling',
                    extension: queue,
                    role: 'answer',
                  },
                },
                integrationId: integration.inboxId,
                retryCount: 1,
                isConvertToJson: true,
                isAddExtention: false,
              },
              {},
            )) as any;
            if (queueProceedingData && queueProceedingData.response) {
              const { CallQueues } = queueProceedingData?.response;
              if (CallQueues) {
                const redisKey = `callRealtimeHistory:${queue}:talking`;
                const oldHistory = await redis.get(redisKey);

                if (!oldHistory) {
                  await redis.set(redisKey, JSON.stringify(CallQueues));
                } else {
                  const oldHistoryParsed = JSON.parse(oldHistory);

                  const oldCallerIds = oldHistoryParsed?.member
                    ?.map((item) => item.callerid)
                    .sort();
                  const newCallerIds = CallQueues.member
                    ?.map((item) => item.callerid)
                    .sort();

                  if (!arraysEqual(oldCallerIds, newCallerIds)) {
                    await redis.set(
                      redisKey,
                      JSON.stringify({
                        ...CallQueues,
                        member: CallQueues.member,
                      }),
                    );

                    const talkingKey = `callRealtimeHistory:${queue}:talking`;
                    const history = (await redis.get(talkingKey)) || [];

                    graphqlPubsub.publish(`talkingCallReceived`, {
                      talkingCallReceived: JSON.parse(JSON.stringify(history)),
                    });
                  }
                }
              }
            }

            const callQueueMemberList = (await sendToGrandStream(
              models,
              {
                path: 'api',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: {
                  request: {
                    action: 'getCallQueuesMemberMessage',
                    extension: queue,
                  },
                },
                integrationId: integration.inboxId,
                retryCount: 1,
                isConvertToJson: true,
                isAddExtention: false,
              },
              {},
            )) as any;
            if (callQueueMemberList && callQueueMemberList.response) {
              const { CallQueueMembersMessage } = callQueueMemberList?.response;
              if (CallQueueMembersMessage) {
                const redisKey = `callRealtimeHistory:${queue}:agent`;
                const oldHistory = await redis.get(redisKey);

                if (!oldHistory) {
                  await redis.set(
                    redisKey,
                    JSON.stringify(CallQueueMembersMessage),
                  );
                } else {
                  const oldHistoryParsed = JSON.parse(oldHistory);
                  if (
                    !arraysEqual(
                      oldHistoryParsed.member || [],
                      CallQueueMembersMessage?.member || [],
                    )
                  ) {
                    await redis.set(
                      redisKey,
                      JSON.stringify({
                        ...CallQueueMembersMessage,
                        member: CallQueueMembersMessage.member,
                      }),
                    );

                    const agentKey = `callRealtimeHistory:${queue}:agent`;
                    const history = (await redis.get(agentKey)) || [];
                    graphqlPubsub.publish(`agentCallReceived`, {
                      agentCallReceived: JSON.parse(JSON.stringify(history)),
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  handleHourlyJob: async ({ subdomain }) => {
    const VERSION = getEnv({ name: 'VERSION' });
    console.log('Starting hourly job...');

    // Common processing function for both versions
    const processIntegrations = async (models, subdomain) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

      const integrations = await models.Integrations.find({
        inboxId: { $exists: true },
      }).lean();
      for (const integration of integrations) {
        try {
          // Process missing record URLs
          const noUrlHistories = await models.CallHistory.find({
            inboxIntegrationId: integration.inboxId,
            callStatus: 'connected',
            recordUrl: { $in: [null, '', 'invalid file type'] },
            createdAt: { $gte: today },
          }).lean();
          console.log(noUrlHistories, 'noUrlHistories');

          await Promise.all(
            noUrlHistories.map(async (history) => {
              const callRecordUrl = await getRecordUrl(
                { ...history, isCronRunning: true },
                '',
                models,
                subdomain,
              );

              if (callRecordUrl) {
                await models.CallHistory.updateOne(
                  { _id: history._id },
                  { $set: { recordUrl: callRecordUrl } },
                );
              }
            }),
          );

          // Batch update stale active calls
          await models.CallHistory.updateMany(
            {
              inboxIntegrationId: integration.inboxId,
              callStatus: 'active',
              createdAt: {
                $gte: today,
                $lte: threeHoursAgo,
              },
            },
            { $set: { callStatus: 'connected' } },
          );
        } catch (e) {
          console.error(`Error processing integration ${integration._id}:`, e);
        }
      }
    };

    // OS Version Handler
    const handleOsVersion = async () => {
      const models = await generateModels(subdomain);
      await processIntegrations(models, subdomain);
    };

    // SaaS Version Handler
    const handleSaasVersion = async () => {
      const orgs = await getOrganizations();
      await Promise.all(
        orgs.map(async (org) => {
          try {
            const models = await generateModels(org.subdomain);
            await processIntegrations(models, org.subdomain); // Use org subdomain
          } catch (e) {
            console.error(`Error processing org ${org._id}:`, e);
          }
        }),
      );
    };

    try {
      if (VERSION === 'os') {
        await handleOsVersion();
      } else if (VERSION === 'saas') await handleSaasVersion();
      console.log('Successfully ran hourly job');
    } catch (e) {
      console.error('Error in main job execution:', e);
    }
  },

  handle10MinutelyJob: async ({ subdomain }) => {
    const VERSION = getEnv({ name: 'VERSION' });
    //save forwarded operator data
    const processCdrData = async (
      models,
      operator,
      startTime,
      endTime,
      result,
      subdomain,
    ) => {
      const fetchAndSaveCdr = async (direction, operatorField) => {
        const cdrData = await sendToGrandStream(
          models,
          {
            path: 'api',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: {
              request: {
                action: 'cdrapi',
                format: 'json',
                [direction]: operator[operatorField],
                startTime,
                endTime,
              },
            },
            integrationId: result.inboxId,
            retryCount: 1,
            isConvertToJson: true,
            isGetExtension: false,
            isCronRunning: true,
          },
          '',
        );
        const cdrRoot = cdrData.response?.cdr_root || cdrData.cdr_root;
        await saveCdrData(subdomain, cdrRoot, result);
      };

      await fetchAndSaveCdr('callee', 'gsUsername'); // Incoming CDR
      await fetchAndSaveCdr('caller', 'gsUsername'); // Outgoing CDR
    };

    const processResults = async (models, results, subdomain) => {
      const startTime = getPureDate(new Date(), -600);
      const endTime = getPureDate(new Date(), 10);

      for (const result of results) {
        for (const operator of result.operators) {
          if (operator.gsForwardAgent) {
            await processCdrData(
              models,
              operator,
              startTime,
              endTime,
              result,
              subdomain,
            );
          }
        }
      }
    };

    const handleOsVersion = async () => {
      const models = await generateModels(subdomain);
      const results = await models.Integrations.find({
        'operators.gsForwardAgent': true,
      });
      await processResults(models, results, subdomain);
    };

    const handleSaasVersion = async () => {
      const orgs = await getOrganizations();

      for (const org of orgs) {
        const models = await generateModels(org.subdomain);
        const results = await models.Integrations.find({
          'operators.gsForwardAgent': true,
        });
        await processResults(models, results, org.subdomain);
      }
    };

    if (VERSION === 'os') {
      await handleOsVersion();
    } else if (VERSION === 'saas') {
      // await handleSaasVersion();
    }
  },
};
