import {
  isEnabled,
  markResolvers,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { Resolver } from 'erxes-api-shared/core-types';
import * as momentTz from 'moment-timezone';
import { IModels, IContext } from '~/connectionResolvers';
import { IIntegrationDocument } from '~/modules/inbox/@types/integrations';

const isMessengerOnline = async (
  models: IModels,
  integration: IIntegrationDocument,
  userTimezone?: string,
) => {
  if (!integration.messengerData) {
    return false;
  }

  const { availabilityMethod, isOnline, onlineHours, timezone } =
    integration.messengerData;

  const modifiedIntegration = {
    ...(integration.toJSON ? integration.toJSON() : integration),
    messengerData: {
      availabilityMethod,
      isOnline,
      onlineHours,
      timezone,
    },
  };

  return models.Integrations.isOnline(modifiedIntegration, userTimezone);
};

const fetchUsers = async (
  models: IModels,
  subdomain: string,
  integration: IIntegrationDocument,
  query: any,
) => {
  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'find',
    input: {
      query,
    },
  });
  for (const user of users) {
    if (user.details && user.details.location) {
      user.isOnline = await isMessengerOnline(
        models,
        integration,
        user.details.location,
      );
    }
  }

  return users;
};

const getWidgetMessages = (models: IModels, conversationId: string) => {
  return models.ConversationMessages.find({
    conversationId,
    internal: false,
    // fromBot: { $exists: false }
  }).sort({
    createdAt: 1,
  });
};

export const widgetQueries: Record<string, Resolver> = {
  async widgetsGetMessengerIntegration(
    _root,
    args: { brandCode: string },
    { models }: IContext,
  ) {
    return models.Integrations.getWidgetIntegration(
      args.brandCode,
      'messenger',
    );
  },

  async widgetsConversations(
    _root,
    args: { integrationId: string; customerId?: string; visitorId?: string },
    { models }: IContext,
  ) {
    const { integrationId, customerId, visitorId } = args;

    const query = customerId
      ? { integrationId, customerId }
      : { integrationId, visitorId };

    return models.Conversations.find(query).sort({ updatedAt: -1 });
  },
  async widgetsConversationDetail(
    _root,
    args: { _id: string; integrationId: string },
    { models, subdomain }: IContext,
  ) {
    try {
      const { _id, integrationId } = args;

      const [conversation, integration] = await Promise.all([
        models.Conversations.findOne({ _id, integrationId }),
        models.Integrations.findOne({ _id: integrationId }),
      ]);

      if (!integration) return null;

      type GetStartedCondition = { isSelected?: boolean } | any;

      let getStartedCondition: GetStartedCondition = false;

      if (await isEnabled('automations')) {
        const getStarted = await sendTRPCMessage({
          subdomain,
          pluginName: 'automations',
          method: 'query',
          module: 'triggers',
          action: 'find',
          input: {
            query: {
              triggerType: 'inbox:messages',
              botId: integration._id,
            },
          },
        }).catch((error) => {
          throw error;
        });

        getStartedCondition = (
          getStarted[0]?.triggers[0]?.config?.conditions || []
        ).find((condition) => condition.type === 'getStarted');
      }

      const messengerData = integration.messengerData || {
        supporterIds: [],
        persistentMenus: [],
        botGreetMessage: '',
      };

      if (!conversation) {
        return {
          persistentMenus: messengerData.persistentMenus,
          botGreetMessage: messengerData.botGreetMessage,
          getStarted:
            getStartedCondition && typeof getStartedCondition !== 'boolean'
              ? getStartedCondition.isSelected ?? false
              : false,
          messages: [],
          isOnline: await isMessengerOnline(models, integration),
        };
      }

      const [messages, participatedUsers, readUsers, supporters, isOnline] =
        await Promise.all([
          getWidgetMessages(models, conversation._id),
          fetchUsers(models, subdomain, integration, {
            _id: { $in: conversation.participatedUserIds },
          }),
          fetchUsers(models, subdomain, integration, {
            _id: { $in: conversation.readUserIds },
          }),
          fetchUsers(models, subdomain, integration, {
            _id: { $in: messengerData.supporterIds },
          }),
          isMessengerOnline(models, integration),
        ]);

      return {
        _id,
        persistentMenus: messengerData.persistentMenus,
        botGreetMessage: messengerData.botGreetMessage,
        getStarted: getStartedCondition
          ? getStartedCondition.isSelected
          : false,
        messages,
        isOnline,
        operatorStatus: conversation.operatorStatus,
        participatedUsers,
        readUsers,
        supporters,
      };
    } catch (error) {
      throw new Error(`Failed to fetch conversation details: ${error.message}`);
    }
  },

  async widgetsMessages(
    _root,
    args: { conversationId: string },
    { models }: IContext,
  ) {
    const { conversationId } = args;

    return getWidgetMessages(models, conversationId);
  },

  async widgetsUnreadCount(
    _root,
    args: { conversationId: string },
    { models }: IContext,
  ) {
    const { conversationId } = args;

    return models.ConversationMessages.widgetsGetUnreadMessagesCount(
      conversationId,
    );
  },

  async widgetsTotalUnreadCount(
    _root,
    args: { integrationId: string; customerId?: string },
    { models }: IContext,
  ) {
    const { integrationId, customerId } = args;

    if (!customerId) {
      return 0;
    }
    // find conversations
    const convs = await models.Conversations.find({
      integrationId,
      customerId,
    });

    // find read messages count
    return models.ConversationMessages.countDocuments(
      models.Conversations.widgetsUnreadMessagesQuery(convs),
    );
  },

  async widgetsMessengerSupporters(
    _root,
    { integrationId }: { integrationId: string },
    { models, subdomain }: IContext,
  ) {
    const integration = await models.Integrations.findOne({
      _id: integrationId,
    });

    let timezone = momentTz.tz.guess();

    if (!integration) {
      return {
        supporters: [],
        isOnline: false,
      };
    }

    const messengerData = integration.messengerData || { supporterIds: [] };

    if (integration.messengerData && integration.messengerData.timezone) {
      timezone = integration.messengerData.timezone;
    }

    return {
      supporters: await fetchUsers(models, subdomain, integration, {
        _id: { $in: messengerData.supporterIds || [] },
      }),
      isOnline: await isMessengerOnline(models, integration),
      timezone,
    };
  },

  async widgetsTicketCustomerDetail(
    _root,
    args: { customerId?: string; type?: string },
    { subdomain }: IContext,
  ) {
    const { customerId } = args;
    if (!customerId) {
      return null;
    }

    return sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: { query: { _id: customerId } },
    });
  },
  async widgetsGetTicketTags(
    _root,
    args: { configId: string },
    { models, subdomain }: IContext,
  ) {
    const config = await models.TicketConfig.getTicketConfig(args.configId);

    if (config && config.ticketBasicFields?.isShowTags) {
      return await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'tags',
        action: 'find',
        input: {
          query: { type: 'frontline:ticket' },
        },
      });
    }
    return [];
  },
  async widgetTicketCheckProgress(
    _root,
    args: {
      number?: string;
    },
    { models }: IContext,
  ) {
    const { number } = args;
    if (!number) {
      throw new Error('Ticket number is required');
    }

    const ticket = await models.Ticket.findOne({ number });

    if (!ticket) {
      throw new Error('Ticket not found');
    }
    return ticket;
  },
  async widgetTicketComments(
    _root,
    args: {
      contentId: string;
    },
    { models }: IContext,
  ) {
    const { contentId } = args;
    if (!contentId) {
      throw new Error('ContentId is required');
    }

    const notes = await models.Note.getNotes({ contentId });

    if (!notes) {
      throw new Error('notes not found');
    }
    return notes;
  },

  async widgetTicketActivityLogs(
    _root,
    args: { contentId: string },
    { models }: IContext,
  ) {
    const { contentId } = args;
    return (await models.Activity.find({ contentId })) || [];
  },
  async widgetTicketsByCustomer(
    _root,
    args: { customerId },
    { models, subdomain }: IContext,
  ) {
    const { customerId } = args;
    const relations = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'relation',
      action: 'getRelationsByEntities',
      input: {
        contentType: 'core:customer',
        contentId: customerId,
      },
    });

    const ticketContentIds = relations.flatMap((r) =>
      r.entities
        .filter((e) => e.contentType === 'frontline:ticket')
        .map((e) => e.contentId),
    );

    return await models.Ticket.find({
      _id: { $in: ticketContentIds },
    });
  },
};

markResolvers(widgetQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});
