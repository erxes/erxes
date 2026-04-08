import graphqlPubsub from "@erxes/api-utils/src/graphqlPubsub";
import { CONVERSATION_STATUSES } from "./models/definitions/constants";
import { sendCoreMessage } from "./messageBroker";
import { generateModels } from "./connectionResolver";
import {
  IConversation,
  IConversationDocument,
} from "./models/definitions/conversations";
import {
  RPError,
  RPResult,
  RPSuccess,
} from "@erxes/api-utils/src/messageBroker";

const sendError = (message): RPError => ({
  status: "error",
  errorMessage: message,
});

const sendSuccess = (data): RPSuccess => ({
  status: "success",
  data,
});

/*
 * Handle requests from integrations api
 */
export const receiveRpcMessage = async (subdomain, data): Promise<RPResult> => {
  const { action, metaInfo, payload } = data;

  const { Integrations, ConversationMessages, Conversations } =
    await generateModels(subdomain);

  const doc = JSON.parse(payload || "{}");

  if (action === "get-create-update-customer") {
    const integration = await Integrations.findOne({
      _id: doc.integrationId,
    });

    if (!integration) {
      return sendError(`Integration not found: ${doc.integrationId}`);
    }

    const { primaryEmail, primaryPhone, kind } = doc;

    let customer;

    const getCustomer = async (selector) =>
      sendCoreMessage({
        subdomain,
        action: "customers.findOne",
        data: selector,
        isRPC: true,
      });

    if (primaryPhone) {
      customer = await getCustomer({ customerPrimaryPhone: primaryPhone });
      if (customer) {
        try {
          await sendCoreMessage({
            subdomain,
            action: "customers.updateCustomer",
            data: {
              _id: customer._id,
              doc,
            },
            isRPC: true,
          });
        } catch (error) {
          if (kind === "calls" && error.message === "Duplicated phone") {
            return sendSuccess({ _id: customer._id });
          }
          throw error;
        }
        return sendSuccess({ _id: customer._id });
      }
    }

    if (primaryEmail) {
      customer = await getCustomer({ primaryEmail });
    }

    if (customer) {
      return sendSuccess({ _id: customer._id });
    } else {
      customer = await sendCoreMessage({
        subdomain,
        action: "customers.createCustomer",
        data: {
          ...doc,
          scopeBrandIds: integration.brandId,
        },
        isRPC: true,
      });
    }

    return sendSuccess({ _id: customer._id });
  }

  if (action === "create-or-update-conversation") {
    const {
      conversationId,
      content,
      owner,
      updatedAt,
      customerId,
      integrationId,
    } = doc;
    let user;
    if (owner) {
      user = await sendCoreMessage({
        subdomain,
        action: "users.findOne",
        data: {
          "details.operatorPhone": owner,
        },
        isRPC: true,
        defaultValue: {},
      });
    }

    let assignedUserId = user ? user._id : null;

    if (conversationId) {
      if (!assignedUserId) {
        const existingConversation = await Conversations.findOne({
          _id: conversationId,
        });
        assignedUserId = existingConversation?.assignedUserId || null;
      }
      const conversation = await Conversations.findOne({
        _id: conversationId,
      });
      if (conversation) {
        let updatedDoc = {
          content,
          assignedUserId,
          updatedAt,
          // mark this conversation as unread
          readUserIds: [],

          // reopen this conversation if it's closed
          status: CONVERSATION_STATUSES.OPEN,
        } as any;
        if (customerId) {
          updatedDoc.customerId = customerId;
        }
        await Conversations.updateConversation(conversationId, updatedDoc);
      } else {
        const formattedDoc = {
          _id: doc.conversationId,
          customerId: doc.customerId,
          integrationId: doc.integrationId,
          content: doc.content,
          attachments: doc.attachments,
          conversationId: doc.conversationId,
          updatedAt: doc.updatedAt,
        };
        await Conversations.createConversation(formattedDoc);
      }

      return sendSuccess({ _id: conversationId });
    }

    doc.assignedUserId = assignedUserId;

    const conversation = await Conversations.createConversation(doc);

    return sendSuccess({ _id: conversation._id });
  }

  if (action === "create-conversation-message") {
    const message = await ConversationMessages.createMessage(doc);

    const conversationDoc: {
      status: string;
      readUserIds: string[];
      content?: string;
      updatedAt?: Date;
    } = {
      // Reopen its conversation if it's closed
      status:
        doc.unread || doc.unread === undefined
          ? CONVERSATION_STATUSES.OPEN
          : CONVERSATION_STATUSES.CLOSED,

      // Mark as unread
      readUserIds: [],
    };

    if (message.content && metaInfo === "replaceContent") {
      conversationDoc.content = message.content;
    }

    if (doc.createdAt) {
      conversationDoc.updatedAt = doc.createdAt;
    }

    await Conversations.updateConversation(
      message.conversationId,
      conversationDoc,
    );

    // FIXME: Find userId and `conversationClientMessageInserted:${userId}`
    // graphqlPubsub.publish('conversationClientMessageInserted', {
    //   conversationClientMessageInserted: message,
    // });

    graphqlPubsub.publish(
      `conversationMessageInserted:${message.conversationId}`,
      {
        conversationMessageInserted: message,
      },
    );

    return sendSuccess({ _id: message._id });
  }

  if (action === "get-configs") {
    const configs = await sendCoreMessage({
      subdomain,
      action: "getConfigs",
      data: {},
      isRPC: true,
    });

    return sendSuccess({ configs });
  }

  if (action === "getUserIds") {
    const users = await sendCoreMessage({
      subdomain,
      action: "users.getIds",
      data: {},
      isRPC: true,
      defaultValue: [],
    });

    return sendSuccess({ userIds: users.map((user) => user._id) });
  }
  throw new Error(`Unknown action: ${action}`);
};

/*
 * Integrations api notification
 */
export const receiveIntegrationsNotification = async (subdomain, msg) => {
  const { action, conversationId } = msg;

  const models = await generateModels(subdomain);

  if (action === "external-integration-entry-added") {
    graphqlPubsub.publish("conversationExternalIntegrationMessageInserted", {});

    if (conversationId) {
      await models.Conversations.reopen(conversationId);
      // FIXME: It must have _id
      // await pConversationClientMessageInserted(models, subdomain, {
      //   conversationId,
      // });
    }

    return sendSuccess({ status: "ok" });
  }

  if (action === "sync-calendar-event") {
    graphqlPubsub.publish("calendarEventUpdated", {});

    return sendSuccess({ status: "ok" });
  }
};

/**
 * Remove engage conversations
 */
export const removeEngageConversations = async (models, _id) => {
  await models.Conversations.removeEngageConversations(_id);
};

export const collectConversations = async (
  subdomain: string,
  { contentId }: { contentId: string },
) => {
  const models = await generateModels(subdomain);
  const results: any[] = [];

  const activities = await sendCoreMessage({
    subdomain,
    action: "activityLogs.findMany",
    data: {
      query: {
        contentId,
        action: "convert",
      },
      options: {
        content: 1,
      },
    },
    isRPC: true,
    defaultValue: [],
  });

  const contentIds = activities.map((activity) => activity.content);

  let conversations: IConversationDocument[] = [];

  if (!contentIds.length) {
    conversations = await models.Conversations.find({
      $or: [{ customerId: contentId }, { participatedUserIds: contentId }],
    }).lean();
  } else {
    conversations = await models.Conversations.find({
      _id: { $in: contentIds },
    }).lean();
  }

  for (const c of conversations) {
    results.push({
      _id: c._id,
      contentType: "inbox:conversation",
      contentId,
      createdAt: c.createdAt,
      contentTypeDetail: {
        integration: await models.Integrations.findOne({
          _id: c.integrationId,
        }),
      },
    });
  }

  return results;
};
