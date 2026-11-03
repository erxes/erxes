import {
  isEnabled,
  markResolvers,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { Resolver } from 'erxes-api-shared/core-types';
import * as momentTz from 'moment-timezone';
import { IModels, IContext } from '~/connectionResolvers';
import { IIntegrationDocument } from '~/modules/inbox/@types/integrations';
import { toCustomerConversationView } from '@/inbox/utils/customerConversationView';
import {
  assertOwnsConversation,
  assertOwnsTicket,
  getOwnedTicketIds,
  isOwnedBySession,
  requireWidgetSession,
  resolveSessionCustomerId,
  widgetOwnerSelector,
} from '@/inbox/widgetSession';

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
    if (user.details?.location) {
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
  async widgetsConversations(
    _root,
    { integrationId }: { integrationId: string },
    { models, req }: IContext,
  ) {
    const session = requireWidgetSession(req, integrationId);

    const conversations = await models.Conversations.find({
      integrationId,
      ...widgetOwnerSelector(session),
    }).sort({
      updatedAt: -1,
    });

    return conversations.map(toCustomerConversationView);
  },
  async widgetsConversationDetail(
    _root,
    args: { _id: string; integrationId: string },
    { models, subdomain, req }: IContext,
  ) {
    const { _id, integrationId } = args;
    const session = requireWidgetSession(req, integrationId);

    try {
      const [foundConversation, integration] = await Promise.all([
        _id ? models.Conversations.findOne({ _id, integrationId }) : null,
        models.Integrations.findOne({ _id: integrationId }),
      ]);

      // Someone else's conversation reads as no conversation at all.
      const conversation = isOwnedBySession(session, foundConversation)
        ? foundConversation
        : null;

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
    { conversationId }: { conversationId: string },
    { models, req }: IContext,
  ) {
    const session = requireWidgetSession(req);

    assertOwnsConversation(
      session,
      await models.Conversations.findOne({ _id: conversationId }),
    );

    return getWidgetMessages(models, conversationId);
  },

  async widgetsUnreadCount(
    _root,
    { conversationId }: { conversationId: string },
    { models, req }: IContext,
  ) {
    const session = requireWidgetSession(req);

    assertOwnsConversation(
      session,
      await models.Conversations.findOne({ _id: conversationId }),
    );

    return models.ConversationMessages.widgetsGetUnreadMessagesCount(
      conversationId,
    );
  },

  async widgetsTotalUnreadCount(
    _root,
    { integrationId }: { integrationId: string },
    { models, req }: IContext,
  ) {
    const session = requireWidgetSession(req, integrationId);

    const convs = await models.Conversations.find({
      integrationId,
      ...widgetOwnerSelector(session),
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

    if (integration.messengerData?.timezone) {
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
    _args: { type?: string },
    { subdomain, req }: IContext,
  ) {
    const customerId = await resolveSessionCustomerId(
      subdomain,
      requireWidgetSession(req),
    );

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
    args: { configId: string; parentId?: string },
    { models, subdomain }: IContext,
  ) {
    const config = await models.TicketConfig.getTicketConfig(args.configId);

    if (config?.formFields?.tags?.isShow) {
      return await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'tags',
        action: 'find',
        input: {
          query: { type: 'frontline:ticket', parentId: args.parentId },
        },
      });
    }
    return [];
  },
  async widgetTicketCheckProgress(
    _root,
    { number }: { number?: string },
    { models, subdomain, req }: IContext,
  ) {
    const session = requireWidgetSession(req);

    if (!number) {
      throw new Error('Ticket number is required');
    }

    // Ticket numbers are guessable, so only the customer's own count.
    const ticket = await models.Ticket.findOne({
      number,
      _id: { $in: await getOwnedTicketIds(subdomain, session, models) },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }
    return ticket;
  },
  async widgetTicketComments(
    _root,
    { contentId }: { contentId: string },
    { models, subdomain, req }: IContext,
  ) {
    await assertOwnsTicket(
      subdomain,
      requireWidgetSession(req),
      contentId,
      models,
    );

    const notes = await models.Note.getNotes({ contentId });

    if (!notes) {
      throw new Error('notes not found');
    }
    return notes;
  },

  async widgetTicketActivityLogs(
    _root,
    { contentId }: { contentId: string },
    { models, subdomain, req }: IContext,
  ) {
    await assertOwnsTicket(
      subdomain,
      requireWidgetSession(req),
      contentId,
      models,
    );

    return (await models.Activity.find({ contentId })) || [];
  },
  async widgetTicketsByCustomer(
    _root,
    _args: Record<string, never>,
    { models, subdomain, req }: IContext,
  ) {
    const ticketIds = await getOwnedTicketIds(
      subdomain,
      requireWidgetSession(req),
      models,
    );

    return models.Ticket.find({ _id: { $in: ticketIds } });
  },
};

markResolvers(widgetQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});
