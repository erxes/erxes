import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { INotesParams } from '@/integrations/call/@types/conversationNotes';
import {
  ICallHistory,
  ICallHistoryFilterOptions,
} from '@/integrations/call/@types/histories';
import {
  deriveCallStatusFromLegs,
  selectRelevantCdr,
} from '@/integrations/call/services/cdrUtils';
import {
  mapCdrToCallHistory,
  mapSessionToCallHistory,
  sendToGrandStream,
} from '@/integrations/call/utils';
import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import redis from '../../redlock';

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
    }).lean();

    if (!integration) {
      return null;
    }

    const { token, ...safe } = integration as any;
    return safe;
  },

  async callUserIntegrations(_root, _args, { models, user }: IContext) {
    // const isAdmin =
    //   user.isOwner || user.permissionGroupIds?.includes('frontline:admin');
    // return models.CallIntegrations.getIntegrations(user._id, isAdmin);
    const res = models.CallIntegrations.getIntegrations(user._id);
    return res;
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
    return models.CallConfigs.find({});
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
    console.log(queueData, 'extension list queueData');

    if (queueData?.response) {
      const { account } = queueData.response;

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
      } catch (e) {
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
        const cdr = await models.CallCdrs.findOne({ _id });
        if (cdr) {
          const history = mapCdrToCallHistory(cdr);
          if (cdr.uniqueid) {
            const legs = await models.CallCdrs.find({
              uniqueid: cdr.uniqueid,
            });
            if (legs.length) {
              history.callStatus = deriveCallStatusFromLegs(legs);
            }
          }
          return history;
        }

        result = await models.CallHistory.findOne({ _id });
        if (result) {
          return result;
        }
      }

      if (conversationId) {
        const histories = await models.CallCdrs.find({
          conversationId: conversationId,
        });

        const selected = selectRelevantCdr(histories);

        if (selected) {
          const history = mapCdrToCallHistory(selected);
          history.callStatus = deriveCallStatusFromLegs(histories);
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
    } catch (error) {
      throw new Error('Failed to retrieve call history details');
    }
  },

  async callGetAnwseredCalls(_args, { uniqueId }, { models }: IContext) {
    return await models.CallCdrs.find({
      uniqueid: uniqueId,
    });
  },
};
markResolvers(callQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});
export default callQueries;
