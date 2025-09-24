import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';
import { sendToGrandStream } from '../../utils';
import redis from '../../redlock';
import { XMLParser } from 'fast-xml-parser';

export interface IHistoryArgs {
  limit?: number;
  callStatus?: string;
  callType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
  searchValue?: string;
  skip?: number;
  integrationId?: string;
}

const callsQueries = {
  async callsIntegrationDetail(_root, { integrationId }, { models }: IContext) {
    return models.Integrations.findOne({ inboxId: integrationId });
  },

  async callUserIntegrations(_root, _args, { models, user }: IContext) {
    const res = models.Integrations.getIntegrations(user._id);

    return res;
  },

  async callsCustomerDetail(_root, { customerPhone }, { subdomain }: IContext) {
    let customer = await sendCommonMessage({
      subdomain,
      isRPC: true,
      serviceName: 'core',
      action: 'customers.findOne',
      data: {
        primaryPhone: customerPhone,
      },
      defaultValue: null,
    });

    return customer;
  },
  async callsActiveSession(_root, {}, { models, user }: IContext) {
    const activeSession = models.ActiveSessions.getActiveSession(user._id);

    return activeSession;
  },
  async callHistories(_root, params: IHistoryArgs, { models, user }: IContext) {
    const activeSession = models.CallHistory.getCallHistories(params, user);

    return activeSession;
  },
  async callHistoriesTotalCount(
    _root,
    params: IHistoryArgs,
    { models, user }: IContext,
  ) {
    return models.CallHistory.getHistoriesCount(params, user);
  },

  async callsGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({}).lean();
  },

  async callGetAgentStatus(
    _root,
    { integrationId },
    { models, user }: IContext,
  ) {
    const integration = await models.Integrations.getIntegration(
      user._id,
      integrationId,
    );
    if (!integration) {
      throw new Error('Integration not found');
    }
    const queues = integration.queues || [];
    const queue = queues?.[0] || '';

    const queueData = (await sendToGrandStream(
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
        integrationId: integrationId,
        retryCount: 3,
        isConvertToJson: true,
        isAddExtention: false,
      },
      user,
    )) as any;

    if (queueData && queueData.response) {
      const { CallQueueMembersMessage } = queueData?.response;

      const operator = integration.operators.find(
        (operator) => operator.userId === user?._id,
      );

      const extentionNumber = operator?.gsUsername || '1001';
      if (CallQueueMembersMessage) {
        const status =
          CallQueueMembersMessage.member.find(
            (member) => member.member_extension === extentionNumber,
          )?.status || '';

        const operator = await models.Operators.getOperator(user._id);

        if (status) {
          if (operator) {
            await models.Operators.updateOperator(user._id, status);
            return status;
          } else if (!operator) {
            await models.Operators.create({
              userId: user._id,
              status,
              extension: extentionNumber,
            });
          }
          return status;
        }
      }
      return 'unAvialable';
    }
  },

  async callExtensionList(
    _root,
    { integrationId },
    { models, user }: IContext,
  ) {
    const integration = await models.Integrations.getIntegration(
      user._id,
      integrationId,
    );
    if (!integration) {
      throw new Error('Integration not found');
    }
    const queueData = (await sendToGrandStream(
      models,
      {
        path: 'api',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          request: {
            action: 'listAccount',
            item_num: '50',
            options: 'extension,fullname,status',
            page: '1',
            sidx: 'extension',
            sord: 'asc',
          },
        },
        integrationId: integrationId,
        retryCount: 3,
        isConvertToJson: true,
        isAddExtention: false,
      },
      user,
    )) as any;

    if (queueData && queueData.response) {
      const { account } = queueData?.response;

      if (account) {
        const gsUsernames = integration.operators.map(
          (operator) => operator.gsUsername,
        );

        const matchedAgents = account.filter(
          (agent) =>
            gsUsernames.includes(agent.extension) &&
            agent.status !== 'Unavailable',
        );

        return matchedAgents;
      }
      return [];
    }
    return 'request failed';
  },
  async callQueueList(_root, { integrationId }, { models, user }: IContext) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const integration = await models.Integrations.getIntegration(
      user._id,
      integrationId,
    );
    if (!integration) {
      throw new Error('Integration not found');
    }
    const queueData = (await sendToGrandStream(
      models,
      {
        path: 'api',
        method: 'POST',
        data: {
          request: {
            action: 'queueapi',
            startTime: formattedDate,
            endTime: formattedDate,
          },
        },
        integrationId: integrationId,
        retryCount: 3,
        isConvertToJson: false,
        isAddExtention: false,
      },
      user,
    )) as any;

    if (!queueData.ok) {
      throw new Error(`HTTP error! Status: ${queueData.status}`);
    }

    const xmlData = await queueData.text();
    try {
      const parsedData = JSON.parse(xmlData);

      if (parsedData.status === -6) {
        console.log('Status -6 detected. Clearing redis callCookie.');
        await redis.del('callCookie');
        const statistics = await models.CallQueueStatistics.find({
          integrationId,
        });
        if (statistics) {
          return statistics;
        }
        return [];
      }
    } catch (error) {
      console.error(error.message);
    }

    try {
      const parser = new XMLParser();
      const jsonObject = parser.parse(xmlData);

      const rootStatistics = jsonObject.root_statistics || {};
      const queues = (rootStatistics.queue as any) || [];

      if (queues && queues.length > 0) {
        const normalizedQueues = queues?.map((q) => ({
          queuechairman: q.queuechairman,
          queue: q.queue,
          totalCalls: q.total_calls,
          answeredCalls: q.answered_calls,
          answeredRate: q.answered_rate,
          abandonedCalls: q.abandoned_calls,
          avgWait: q.avg_wait,
          avgTalk: q.avg_talk,
          vqTotalCalls: q.vq_total_calls,
          slaRate: q.sla_rate,
          vqSlaRate: q.vq_sla_rate,
          transferOutCalls: q.transfer_out_calls,
          transferOutRate: q.transfer_out_rate,
          abandonedRate: q.abandoned_rate,
          integrationId,
        }));

        if (integration.queues && normalizedQueues.length > 0) {
          const filteredQueues = normalizedQueues.filter((q) =>
            integration.queues.includes(q.queue.toString()),
          );

          for (const queue of filteredQueues) {
            await models.CallQueueStatistics.findOneAndUpdate(
              { integrationId, queue: queue.queue },
              { $set: queue },
              { upsert: true, new: true },
            );
          }

          return filteredQueues;
        }
        const stats = await models.CallQueueStatistics.find({ integrationId });
        if (stats) {
          return stats;
        }
        return [];
      }
    } catch (error) {
      const stats = await models.CallQueueStatistics.find({ integrationId });
      if (stats) {
        return stats;
      }
      return [];
    }
  },

  async callWaitingList(_root, { queue }) {
    const redisKey = `callRealtimeHistory:${queue}:waiting`;
    return await redis.get(redisKey);
  },

  async callProceedingList(_root, { queue }) {
    const redisKey = `callRealtimeHistory:${queue}:talking`;
    return await redis.get(redisKey);
  },

  async callQueueMemberList(
    _root,
    { integrationId, queue },
    { models, user }: IContext,
  ) {
    const queueData = (await sendToGrandStream(
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
        integrationId: integrationId,
        retryCount: 3,
        isConvertToJson: true,
        isAddExtention: false,
      },
      user,
    )) as any;

    if (queueData && queueData.response) {
      const { CallQueueMembersMessage } = queueData?.response;

      if (CallQueueMembersMessage) {
        return CallQueueMembersMessage;
      }
      return [];
    }
    return 'request failed';
  },

  async callCustomers(_root, { phoneNumber }, { subdomain }: IContext) {
    let customers = await sendCommonMessage({
      subdomain,
      isRPC: true,
      serviceName: 'core',
      action: 'customers.find',
      data: {
        $or: [
          { primaryPhone: phoneNumber },
          { 'phones.phone': { $in: [phoneNumber] } },
        ],
      },
      defaultValue: null,
    });
    return customers;
  },
};

export default callsQueries;
