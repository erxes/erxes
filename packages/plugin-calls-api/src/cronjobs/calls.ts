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

  // handleHourlyJob: async ({ subdomain }) => {
  //   const VERSION = getEnv({ name: 'VERSION' });
  //   console.log('Starting hourly job...');

  //   // Common processing function for both versions
  //   const processIntegrations = async (models, subdomain) => {
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);
  //     const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

  //     const integrations = await models.Integrations.find({
  //       inboxId: { $exists: true },
  //     }).lean();
  //     for (const integration of integrations) {
  //       try {
  //         // Process missing record URLs
  //         const noUrlHistories = await models.CallHistory.find({
  //           inboxIntegrationId: integration.inboxId,
  //           callStatus: 'connected',
  //           recordUrl: { $in: [null, '', 'invalid file type'] },
  //           createdAt: { $gte: today },
  //         }).lean();
  //         console.log(noUrlHistories, 'noUrlHistories');

  //         await Promise.all(
  //           noUrlHistories.map(async (history) => {
  //             const callRecordUrl = await getRecordUrl(
  //               { ...history, isCronRunning: true },
  //               '',
  //               models,
  //               subdomain,
  //             );

  //             if (callRecordUrl) {
  //               await models.CallHistory.updateOne(
  //                 { _id: history._id },
  //                 { $set: { recordUrl: callRecordUrl } },
  //               );
  //             }
  //           }),
  //         );

  //         // Batch update stale active calls
  //         await models.CallHistory.updateMany(
  //           {
  //             inboxIntegrationId: integration.inboxId,
  //             callStatus: 'active',
  //             createdAt: {
  //               $gte: today,
  //               $lte: threeHoursAgo,
  //             },
  //           },
  //           { $set: { callStatus: 'connected' } },
  //         );
  //       } catch (e) {
  //         console.error(`Error processing integration ${integration._id}:`, e);
  //       }
  //     }
  //   };

  //   // OS Version Handler
  //   const handleOsVersion = async () => {
  //     const models = await generateModels(subdomain);
  //     await processIntegrations(models, subdomain);
  //   };

  //   // SaaS Version Handler
  //   const handleSaasVersion = async () => {
  //     const orgs = await getOrganizations();
  //     await Promise.all(
  //       orgs.map(async (org) => {
  //         try {
  //           const models = await generateModels(org.subdomain);
  //           await processIntegrations(models, org.subdomain); // Use org subdomain
  //         } catch (e) {
  //           console.error(`Error processing org ${org._id}:`, e);
  //         }
  //       }),
  //     );
  //   };

  //   try {
  //     if (VERSION === 'os') {
  //       await handleOsVersion();
  //     } else if (VERSION === 'saas') await handleSaasVersion();
  //     console.log('Successfully ran hourly job');
  //   } catch (e) {
  //     console.error('Error in main job execution:', e);
  //   }
  // },

  // handle10MinutelyJob: async ({ subdomain }) => {
  //   const VERSION = getEnv({ name: 'VERSION' });
  //   const CALL_CRON_ENABLED = getEnv({ name: 'CALL_CRON_ENABLED' });

  //   //save forwarded operator data
  //   const processCdrData = async (
  //     models,
  //     operator,
  //     startTime,
  //     endTime,
  //     result,
  //     subdomain,
  //   ) => {
  //     const fetchAndSaveCdr = async (direction, operatorField) => {
  //       const cdrData = await sendToGrandStream(
  //         models,
  //         {
  //           path: 'api',
  //           method: 'POST',
  //           headers: { 'Content-Type': 'application/json' },
  //           data: {
  //             request: {
  //               action: 'cdrapi',
  //               format: 'json',
  //               [direction]: operator[operatorField],
  //               startTime,
  //               endTime,
  //             },
  //           },
  //           integrationId: result.inboxId,
  //           retryCount: 1,
  //           isConvertToJson: true,
  //           isGetExtension: false,
  //           isCronRunning: true,
  //         },
  //         '',
  //       );
  //       const cdrRoot = cdrData.response?.cdr_root || cdrData.cdr_root;
  //       await saveCdrData(subdomain, cdrRoot, result);
  //     };

  //     await fetchAndSaveCdr('callee', 'gsUsername'); // Incoming CDR
  //     await fetchAndSaveCdr('caller', 'gsUsername'); // Outgoing CDR
  //   };

  //   const processResults = async (models, results, subdomain) => {
  //     const startTime = getPureDate(new Date(), -600);
  //     const endTime = getPureDate(new Date(), 10);

  //     for (const result of results) {
  //       for (const operator of result.operators) {
  //         if (operator.gsForwardAgent) {
  //           await processCdrData(
  //             models,
  //             operator,
  //             startTime,
  //             endTime,
  //             result,
  //             subdomain,
  //           );
  //         }
  //       }
  //     }
  //   };

  //   const handleOsVersion = async () => {
  //     const models = await generateModels(subdomain);
  //     const results = await models.Integrations.find({
  //       'operators.gsForwardAgent': true,
  //     });
  //     await processResults(models, results, subdomain);
  //   };

  //   const handleSaasVersion = async () => {
  //     const orgs = await getOrganizations();

  //     for (const org of orgs) {
  //       const models = await generateModels(org.subdomain);
  //       const results = await models.Integrations.find({
  //         'operators.gsForwardAgent': true,
  //       });
  //       await processResults(models, results, org.subdomain);
  //     }
  //   };

  //   if (VERSION === 'os' && CALL_CRON_ENABLED) {
  //     await handleOsVersion();
  //   } else if (VERSION === 'saas') {
  //     // await handleSaasVersion();
  //   }
  // },
};
