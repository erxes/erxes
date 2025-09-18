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
    { queue, integrationId },
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
            extension: '6501',
          },
        },
        integrationId: 'Nhl5BLfo37dsYqgQohcqF',
        retryCount: 3,
        isConvertToJson: true,
        isAddExtention: false,
      },
      user,
    )) as any;

    if (queueData && queueData.response) {
      const { CallQueueMembersMessage } = queueData?.response;

      CallQueueMembersMessage.member;
      const integration = await models.Integrations.findOne({
        inboxId: 'Nhl5BLfo37dsYqgQohcqF',
      }).lean();

      if (!integration) {
        throw new Error('Integration not found');
      }
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
  async callQueueList(_root, _args, { models, user }: IContext) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const integrations = (await models.Integrations.getIntegrations(
      user._id,
    )) as any;
    if (!integrations) {
      throw new Error('Integrations not found');
    }
    try {
      let rawResponse = await sendToGrandStream(
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
          integrationId: integrations[0]?.inboxId,
          retryCount: 3,
          isConvertToJson: false,
          isAddExtention: false,
        },
        user,
      );

      rawResponse = await rawResponse?.text();

      if (typeof rawResponse !== 'string') {
        throw new Error('Expected string response from Grandstream');
      }

      let parsedResponse: any;

      try {
        parsedResponse = JSON.parse(rawResponse);

        if (parsedResponse?.status === -6) {
          console.warn('Grandstream status -6, clearing callCookie');
          await redis.del('callCookie');
          return [];
        }
      } catch {
        try {
          const xmlParser = new XMLParser();
          parsedResponse = xmlParser.parse(rawResponse);
        } catch (xmlError) {
          console.error(
            'Failed to parse Grandstream response as XML:',
            xmlError.message,
          );
          return [];
        }
      }

      const queuesData = parsedResponse?.root_statistics?.queue ?? [];
      const seen = new Set<string>();
      const result: any = [];

      let queuesFromResponse = [] as any;
      if (queuesData) {
        if (Array.isArray(queuesData)) {
          queuesFromResponse = queuesData;
        } else {
          queuesFromResponse = [queuesData];
        }
      }
      for (const integration of integrations) {
        const { queues: allowedQueues } = integration;
        if (!Array.isArray(allowedQueues)) continue;

        for (const queue of queuesFromResponse) {
          const queueId = queue?.queue?.toString();
          if (
            queueId &&
            allowedQueues.includes(queueId) &&
            !seen.has(queueId)
          ) {
            seen.add(queueId);
            result.push(queue);
          }
        }
      }
      return result;
    } catch (error) {
      console.error(
        'Unexpected error while fetching user queues:',
        error.message,
      );
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
