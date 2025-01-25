import * as momentTz from "moment-timezone";

import { IIntegrationDocument } from "../../models/definitions/integrations";

import { getOrCreateEngageMessage } from "../../widgetUtils";

import { IBrowserInfo } from "@erxes/api-utils/src/definitions/common";
import { sendCoreMessage, sendKnowledgeBaseMessage } from "../../messageBroker";
import { IContext, IModels } from "../../connectionResolver";

const isMessengerOnline = async (
  models: IModels,
  integration: IIntegrationDocument,
  userTimezone?: string
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
      timezone
    }
  };

  return models.Integrations.isOnline(modifiedIntegration, userTimezone);
};

const fetchUsers = async (
  models: IModels,
  subdomain: string,
  integration: IIntegrationDocument,
  query: any
) => {
  const users = await sendCoreMessage({
    subdomain,
    action: "users.find",
    data: { query },
    isRPC: true,
    defaultValue: []
  });

  for (const user of users) {
    if (user.details && user.details.location) {
      user.isOnline = await isMessengerOnline(
        models,
        integration,
        user.details.location
      );
    }
  }

  return users;
};

const getWidgetMessages = (models: IModels, conversationId: string) => {
  return models.ConversationMessages.find({
    conversationId,
    internal: false,
    fromBot: { $exists: false }
  }).sort({
    createdAt: 1
  });
};

export default {
  async widgetsGetMessengerIntegration(
    _root,
    args: { brandCode: string },
    { models }: IContext
  ) {
    return models.Integrations.getWidgetIntegration(
      args.brandCode,
      "messenger"
    );
  },

  async widgetsConversations(
    _root,
    args: { integrationId: string; customerId?: string; visitorId?: string },
    { models }: IContext
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
    { models, subdomain }: IContext
  ) {
    const { _id, integrationId } = args;

    const conversation = await models.Conversations.findOne({
      _id,
      integrationId
    });
    const integration = await models.Integrations.findOne({
      _id: integrationId
    });

    // When no one writes a message
    if (!conversation && integration) {
      return {
        messages: [],
        isOnline: await isMessengerOnline(models, integration)
      };
    }

    if (!conversation || !integration) {
      return null;
    }

    const messengerData = integration.messengerData || { supporterIds: [] };

    return {
      _id,
      messages: await getWidgetMessages(models, conversation._id),
      isOnline: await isMessengerOnline(models, integration),
      operatorStatus: conversation.operatorStatus,
      participatedUsers: await fetchUsers(models, subdomain, integration, {
        _id: { $in: conversation.participatedUserIds }
      }),
      readUsers: await fetchUsers(models, subdomain, integration, {
        _id: { $in: conversation.readUserIds }
      }),
      supporters: await fetchUsers(models, subdomain, integration, {
        _id: { $in: messengerData.supporterIds }
      })
    };
  },

  async widgetsMessages(
    _root,
    args: { conversationId: string },
    { models }: IContext
  ) {
    const { conversationId } = args;

    return getWidgetMessages(models, conversationId);
  },

  async widgetsUnreadCount(
    _root,
    args: { conversationId: string },
    { models }: IContext
  ) {
    const { conversationId } = args;

    return models.ConversationMessages.widgetsGetUnreadMessagesCount(
      conversationId
    );
  },

  async widgetsTotalUnreadCount(
    _root,
    args: { integrationId: string; customerId?: string },
    { models }: IContext
  ) {
    const { integrationId, customerId } = args;

    if (!customerId) {
      return 0;
    }
    // find conversations
    const convs = await models.Conversations.find({
      integrationId,
      customerId
    });

    // find read messages count
    return models.ConversationMessages.countDocuments(
      models.Conversations.widgetsUnreadMessagesQuery(convs)
    );
  },

  async widgetsMessengerSupporters(
    _root,
    { integrationId }: { integrationId: string },
    { models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.findOne({
      _id: integrationId
    });

    let timezone = momentTz.tz.guess();

    if (!integration) {
      return {
        supporters: [],
        isOnline: false
      };
    }

    const messengerData = integration.messengerData || { supporterIds: [] };

    if (integration.messengerData && integration.messengerData.timezone) {
      timezone = integration.messengerData.timezone;
    }

    return {
      supporters: await fetchUsers(models, subdomain, integration, {
        _id: { $in: messengerData.supporterIds || [] }
      }),
      isOnline: await isMessengerOnline(models, integration),
      timezone
    };
  },

  async widgetsGetEngageMessage(
    _root,
    {
      integrationId,
      customerId,
      visitorId,
      browserInfo
    }: {
      integrationId: string;
      customerId?: string;
      visitorId?: string;
      browserInfo: IBrowserInfo;
    },
    { models, subdomain }: IContext
  ) {
    return getOrCreateEngageMessage(
      models,
      subdomain,
      integrationId,
      browserInfo,
      visitorId,
      customerId
    );
  },

  async widgetsProductCategory(_root, { _id }: { _id: string }) {
    return {
      __typename: "ProductCategory",
      _id
    };
  },

  /*
   * Search published articles that contain searchString (case insensitive)
   * in a topic found by topicId
   * @return {Promise} searched articles
   */
  async widgetsKnowledgeBaseArticles(
    _root: any,
    args: { topicId: string; searchString: string },
    { subdomain }: IContext
  ) {
    const { topicId, searchString = "" } = args;

    return sendKnowledgeBaseMessage({
      subdomain,
      action: "articles.find",
      data: {
        query: {
          topicId,
          content: { $regex: `.*${searchString.trim()}.*`, $options: "i" },
          status: "publish"
        }
      },
      isRPC: true
    });
  },

  /**
   * Topic detail
   */
  async widgetsKnowledgeBaseTopicDetail(
    _root,
    { _id }: { _id: string },
    { subdomain }: IContext
  ) {
    const commonOptions = { subdomain, isRPC: true };

    const topic = await sendKnowledgeBaseMessage({
      ...commonOptions,
      action: "topics.findOne",
      data: {
        query: {
          _id
        }
      }
    });

    if (topic && topic.createdBy) {
      const user = await sendCoreMessage({
        ...commonOptions,
        action: "users.findOne",
        data: {
          _id: topic.createdBy
        },
        defaultValue: {}
      });

      sendCoreMessage({
        subdomain,
        action: "registerOnboardHistory",
        data: {
          type: "knowledgeBaseInstalled",
          user
        }
      });
    }

    return topic;
  },

  async widgetsBootMessengerBots(_root, _args, { models }: IContext) {
    try {
      const bots = await models.Bots.find({});
      // const result = await Promise.all(
      //   bots.map(async (bot) => {
      //     // Define accountData with a proper union type
      //     let accountData: { _id: string; name: string } | null = null;
      //     let page: { id: string; name: string } | null = null;
      //     let getNumber: any = null;

      //     const whatsapp_account = await models.Accounts.getAccount({
      //       _id: bot.accountId
      //     }).catch(() => null);

      //     if (whatsapp_account) {
      //       const accessToken = whatsapp_account.token;

      //       accountData = {
      //         _id: whatsapp_account._id as string,
      //         name: whatsapp_account.name
      //       };

      //       getNumber = await getNumberWhatsApp(
      //         bot.whatsappNumberIds,
      //         accessToken
      //       ).catch(() => null);

      //       if (getNumber?.id) {
      //         page = {
      //           id: getNumber.id,
      //           name: getNumber.display_phone_number
      //         };
      //       }
      //     }

      //     return {
      //       _id: bot._id,
      //       name: bot.name,
      //       accountId: bot.accountId,
      //       account: accountData,
      //       page,
      //       pageId: bot.whatsappNumberIds,
      //       profileUrl: getNumber?.profile_picture_url || "",
      //       persistentMenus: bot.persistentMenus || [],
      //       greetText: bot.greetText || "",
      //       tag: bot.tag || "",
      //       isEnabledBackBtn: bot.isEnabledBackBtn || false,
      //       backButtonText: bot.backButtonText || ""
      //     };
      //   })
      // );

      // return result;
    } catch (error) {
      throw new Error("Failed to fetch Instagram Messenger Bots data.");
    }
  },
  async widgetsBootMessengerBotsTotalCount(_root, _args, { models }: IContext) {
    return await models.Bots.find({}).countDocuments();
  },
  async widgetsBootMessengerBot(_root, { _id }, { models }: IContext) {
    return await models.Bots.findOne({ _id });
  }
};
