import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { INotesParams } from '@/integrations/call/@types/conversationNotes';
import {
  ICallHistory,
  ICallHistoryFilterOptions,
} from '@/integrations/call/@types/histories';
import {
  deriveInboxCallStatus,
  selectRelevantCdr,
} from '@/integrations/call/services/cdrUtils';
import {
  mapCdrToCallHistory,
  mapSessionToCallHistory,
  sendToGrandStream,
} from '@/integrations/call/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { isObjectIdOrHexString } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import redis from '../../redlock';
import { withCloudflareIceServers } from '@/integrations/call/services/iceServers';
import { ICallIntegration } from '@/integrations/call/@types/integrations';

const EXTENSION_PAGE_SIZE = 100;
const MAX_EXTENSION_PAGES = 50;

export interface IUcmAccount {
  extension?: string;
  fullname?: string;
  status?: string;
}

const callQueries = {
  async callsIntegrationDetail(
    _root,
    { integrationId },
    { models, user }: IContext,
  ) {
    if (!user?._id) {
      throw new Error('Login required');
    }

    const integration = await models.CallIntegrations.findOne({
      inboxId: integrationId,
    }).lean<ICallIntegration & { _id: string }>();

    if (!integration) {
      return null;
    }

    // Owners edit operators (callsIntegrationUpdate) and need every SIP
    // password; anyone else only sees their own.
    return {
      ...integration,
      token: undefined,
      operators: (integration.operators || []).map((operator) =>
        user.isOwner || operator.userId === user._id
          ? operator
          : { ...operator, gsPassword: '' },
      ),
    };
  },

  async callUserIntegrations(_root, _args, { models, user }: IContext) {
    // const isAdmin =
    //   user.isOwner || user.permissionGroupIds?.includes('frontline:admin');
    // return models.CallIntegrations.getIntegrations(user._id, isAdmin);
    const integrations = await models.CallIntegrations.getIntegrations(
      user._id,
    );

    const inboxIntegrations = await models.Integrations.find(
      { _id: { $in: integrations.map((integration) => integration.inboxId) } },
      { name: 1 },
    ).lean();

    const nameById = new Map(
      inboxIntegrations.map((integration) => [
        String(integration._id),
        integration.name,
      ]),
    );

    return integrations.map((integration) => ({
      ...integration,
      name: nameById.get(integration.inboxId) || '',
    }));
  },

  async callsCustomerDetail(_root, { customerPhone }, { subdomain }: IContext) {
    const customer = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: { query: { customerPrimaryPhone: customerPhone } },
    });

    return customer;
  },

  async callHistories(
    _root,
    params: ICallHistoryFilterOptions,
    { models, user }: IContext,
  ) {
    return models.CallHistory.getCallHistories(params, user);
  },
  async callHistoriesTotalCount(
    _root,
    params: ICallHistoryFilterOptions,
    { models, user }: IContext,
  ) {
    return models.CallHistory.getHistoriesCount(params, user);
  },

  async callsGetConfigs(_root, _args, { models }: IContext) {
    const configs = await models.CallConfigs.find({}).lean();
    return withCloudflareIceServers(
      configs.map(({ _id, code, value }) => ({
        _id: String(_id),
        code: String(code),
        value,
      })),
    );
  },

  async callGetAgentStatus(_root, _args, { models, user }: IContext) {
    const operator = await models.CallOperators.findOne({ userId: user._id });
    if (operator) {
      return operator.status;
    }
    return 'UnAvailable';
  },

  async callExtensionList(
    _root,
    { integrationId },
    { models, user }: IContext,
  ) {
    // const isAdmin =
    //   user.isOwner || user.permissionGroupIds?.includes('frontline:admin');
    const integration = await models.CallIntegrations.getIntegration(
      user._id,
      integrationId,
    );
    if (!integration) {
      throw new Error('Integration not found');
    }
    const accounts: IUcmAccount[] = [];
    for (let page = 1; page <= MAX_EXTENSION_PAGES; page++) {
      const queueData = await sendToGrandStream(
        models,
        {
          path: 'api',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: {
            request: {
              action: 'listAccount',
              item_num: String(EXTENSION_PAGE_SIZE),
              options: 'extension,fullname,status',
              page: String(page),
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
      );

      if (queueData?.status !== 0 || !queueData.response) {
        throw new Error('Failed to load extensions from the PBX');
      }

      const pageAccounts: IUcmAccount[] = queueData.response.account || [];
      accounts.push(...pageAccounts);

      const totalPages = Number(queueData.response.total_page) || 0;
      if (
        pageAccounts.length < EXTENSION_PAGE_SIZE ||
        (totalPages && page >= totalPages)
      ) {
        break;
      }
    }

    const gsUsernames = integration.operators.map(
      (operator) => operator.gsUsername,
    );

    return accounts.filter(
      (agent) =>
        !!agent.extension &&
        gsUsernames.includes(agent.extension) &&
        agent.status !== 'Unavailable',
    );
  },
  async callQueueList(_root, { integrationId }, { models, user }: IContext) {
    const integration = await models.CallIntegrations.getIntegration(
      user._id,
      integrationId,
    );

    // `CallQueueStatistics` is a cache of live PBX counters and only exists for
    // queues the PBX has reported on, so the queues configured on the
    // integration are the authoritative list.
    const statistics = await models.CallQueueStatistics.find(
      { integrationId },
      { _id: 0, __v: 0 },
    ).lean<Record<string, unknown>[]>();

    const statisticsByQueue = new Map(
      statistics.map((stat) => [String(stat.queue), stat]),
    );

    return (integration.queues || []).map(
      (queue) =>
        statisticsByQueue.get(String(queue)) || { queue, integrationId },
    );
  },

  async callQueueInitialList(
    _root,
    { queue },
    { models, user, subdomain }: IContext,
  ) {
    if (!user?._id) {
      throw new Error('Login required');
    }

    try {
      let owns = false;
      try {
        const queues = await models.CallIntegrations.getIntegrationQueuesByUser(
          user._id,
        );
        owns = queues.map(String).includes(String(queue));
      } catch {
        owns = false;
      }

      if (!owns) {
        console.warn(
          `[call] callQueueInitialList: user ${user._id} is not an operator on queue ${queue}`,
        );
        if (process.env.CALL_SUBSCRIPTION_REQUIRE_AUTH === 'true') {
          return '{}';
        }
      }

      const redisKey = `callRealtimeHistory:${subdomain}:${queue}:aggregate`;
      return (await redis.get(redisKey)) || `{}`;
    } catch (error) {
      console.error(`Failed to fetch queue data for ${queue}:`, error);
      return '{}';
    }
  },

  async callConversationNotes(_root, args: INotesParams, { models }: IContext) {
    const { conversationId, limit, skip, getFirst } = args;

    const conversation = await models.Conversations.findOne({
      _id: conversationId,
    });
    let messages: IMessageDocument[] = [];

    if (conversation) {
      if (limit) {
        const sort: any = getFirst ? { createdAt: 1 } : { createdAt: -1 };

        messages = await models.ConversationMessages.find({
          conversationId: conversationId,
        })
          .sort(sort)
          .skip(skip || 0)
          .limit(limit);

        return getFirst ? messages : messages.reverse();
      }

      messages = await models.ConversationMessages.find({
        conversationId: conversationId,
      })
        .sort({ createdAt: -1 })
        .limit(50);

      return messages.reverse();
    }
  },

  async callHistoryDetail(
    _root: any,
    { _id, conversationId }: { _id?: string; conversationId?: string },
    { models }: IContext,
  ): Promise<ICallHistory | null> {
    if (!_id && !conversationId) {
      throw new Error('Either _id or conversationId is required');
    }

    try {
      let result: ICallHistory | null = null;

      if (_id) {
        // Inbox links pass a CDR _id; older links pass the PBX uniqueid.
        const cdr = await models.CallCdrs.findOne(
          isObjectIdOrHexString(_id) ? { _id } : { uniqueid: _id },
        );
        if (cdr) {
          const history = mapCdrToCallHistory(cdr);
          if (cdr.uniqueid) {
            const legs = await models.CallCdrs.find({
              uniqueid: cdr.uniqueid,
            });
            if (legs.length) {
              history.callStatus = deriveInboxCallStatus(legs);
            }
          }
          return history;
        }

        if (isObjectIdOrHexString(_id)) {
          result = await models.CallHistory.findOne({ _id });
          if (result) {
            return result;
          }
        }
      }

      if (conversationId) {
        const histories = await models.CallCdrs.find({
          conversationId: conversationId,
        });

        const selected = selectRelevantCdr(histories);

        if (selected) {
          const history = mapCdrToCallHistory(selected);
          history.callStatus = deriveInboxCallStatus(histories);
          return history;
        }

        result = await models.CallHistory.findOne({ conversationId });
        if (result) {
          return result;
        }

        const session = await models.CallSessions.findOne({ conversationId });
        if (session) {
          return mapSessionToCallHistory(session);
        }
      }

      return null;
    } catch {
      throw new Error('Failed to retrieve call history details');
    }
  },
};
export default callQueries;
