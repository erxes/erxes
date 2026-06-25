import {
  AUTOMATED_REPLY_STATUS,
  CONVERSATION_STATUSES,
} from '@/inbox/db/definitions/constants';
import {
  graphqlPubsub,
  RPError,
  RPResult,
  RPSuccess,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

const sendError = (message): RPError => ({
  status: 'error',
  errorMessage: message,
});

const sendSuccess = (data): RPSuccess => ({
  status: 'success',
  data,
});

const getAutomatedReplyStatus = (status: unknown) => {
  switch (status) {
    case AUTOMATED_REPLY_STATUS.ACTIVE:
      return AUTOMATED_REPLY_STATUS.ACTIVE;
    case AUTOMATED_REPLY_STATUS.HANDOFF_REQUESTED:
      return AUTOMATED_REPLY_STATUS.HANDOFF_REQUESTED;
    case AUTOMATED_REPLY_STATUS.HUMAN_ACTIVE:
      return AUTOMATED_REPLY_STATUS.HUMAN_ACTIVE;
    default:
      return undefined;
  }
};

const getAutomatedReplyReason = (reason: unknown) => {
  switch (reason) {
    case 'customer_requested':
      return 'customer_requested';
    case 'operator_reply':
      return 'operator_reply';
    case 'manual':
      return 'manual';
    case 'timeout_expired':
      return 'timeout_expired';
    default:
      return undefined;
  }
};

/*
 * Handle requests from integrations api
 */
export const receiveInboxMessage = async (
  subdomain,
  data,
): Promise<RPResult> => {
  const { action, metaInfo, payload } = data;
  const { Integrations, ConversationMessages, Conversations } =
    await generateModels(subdomain);
  let doc = JSON.parse(JSON.stringify(payload) || '{}');
  if (typeof doc === 'string') {
    doc = JSON.parse(doc);
  }

  if (action === 'get-create-update-customer') {
    const integration = await Integrations.findOne({
      _id: doc.integrationId,
    });

    if (!integration) {
      return sendError(`Integration not found: ${doc.integrationId}`);
    }

    const { primaryEmail, primaryPhone } = doc;
    let customer;
    const getCustomer = async (selector) => {
      return await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'customers',
        action: 'findOne',
        input: { query: selector },
      });
    };
    if (primaryPhone) {
      customer = await getCustomer({ customerPrimaryPhone: primaryPhone });
      if (customer) {
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'updateCustomer',
          input: {
            doc: {
              _id: customer._id,
              doc,
            },
          },
        });
        return sendSuccess({ _id: customer._id });
      }
    }

    if (primaryEmail) {
      customer = await getCustomer({ primaryEmail });
    }

    if (customer) {
      return sendSuccess({ _id: customer?._id });
    } else {
      customer = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'createCustomer',
        input: {
          doc: {
            ...doc,
          },
        },
      });
    }
    return sendSuccess({ _id: customer?._id });
  }

  if (action === 'create-or-update-conversation') {
    const {
      conversationId,
      content,
      owner,
      userId,
      updatedAt,
      integrationId,
      customerId,
    } = doc;
    let user;

    // If a direct userId is provided, use it; otherwise look up by operatorPhone
    let assignedUserId: string | null = userId || null;

    if (!assignedUserId && owner) {
      user = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'findOne',
        input: {
          query: {
            'details.operatorPhone': owner,
          },
        },
      });
      assignedUserId = user ? user._id : null;
    }

    if (conversationId) {
      const conversation = await Conversations.findOne({
        _id: conversationId,
      }).lean();

      if (!assignedUserId) {
        assignedUserId = conversation?.assignedUserId || null;
      }

      if (conversation) {
        const updatedDoc = {
          content,
          assignedUserId,
          integrationId,
          updatedAt,

          readUserIds: [],
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

  if (action === 'ensure-automated-reply-control') {
    if (!doc.conversationId) {
      return sendError('conversationId is required');
    }

    const conversation = await Conversations.findOne({
      _id: doc.conversationId,
    });

    if (!conversation) {
      return sendError(`Conversation not found: ${doc.conversationId}`);
    }

    if (!conversation.automatedReplyControl) {
      await Conversations.setAutomatedReplyControl(doc.conversationId, {
        status: AUTOMATED_REPLY_STATUS.ACTIVE,
      });
    }

    return sendSuccess({ _id: doc.conversationId });
  }

  if (action === 'set-automated-reply-control') {
    if (!doc.conversationId) {
      return sendError('conversationId is required');
    }

    const automatedReplyStatus = getAutomatedReplyStatus(doc.status);

    if (!automatedReplyStatus) {
      return sendError('Invalid automated reply status');
    }

    const conversation = await Conversations.setAutomatedReplyControl(
      doc.conversationId,
      {
        status: automatedReplyStatus,
        pausedUntil: doc.pausedUntil ? new Date(doc.pausedUntil) : undefined,
        reason: getAutomatedReplyReason(doc.reason),
        updatedBy: doc.updatedBy,
      },
    );

    return sendSuccess({
      _id: conversation?._id,
      automatedReplyControl: conversation?.automatedReplyControl,
    });
  }

  if (action === 'create-conversation-message') {
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

    if (message.content && metaInfo === 'replaceContent') {
      conversationDoc.content = message.content;
    }

    if (doc.createdAt) {
      conversationDoc.updatedAt = doc.createdAt;
    }

    await Conversations.updateConversation(
      message.conversationId,
      conversationDoc,
    );

    await graphqlPubsub.publish(
      `conversationMessageInserted:${message.conversationId}`,
      {
        conversationMessageInserted: message,
      },
    );
    return sendSuccess({ _id: message._id });
  }

  if (action === 'get-configs') {
    const configs = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query', // this is a mutation, not a query
      module: 'config',
      action: 'getConfig',
      input: {},
    });
    return sendSuccess({ configs });
  }

  if (action === 'getUserIds') {
    const users = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'getIds',
      input: {}, // empty input as per original
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

  if (action === 'external-integration-entry-added') {
    await graphqlPubsub.publish(
      'conversationExternalIntegrationMessageInserted',
      {},
    );

    if (conversationId) {
      await models.Conversations.reopen(conversationId);
      // FIXME: It must have _id
      // await pConversationClientMessageInserted(models, subdomain, {
      //   conversationId,
      // });
    }

    return sendSuccess({ status: 'ok' });
  }

  if (action === 'sync-calendar-event') {
    await graphqlPubsub.publish('calendarEventUpdated', {});

    return sendSuccess({ status: 'ok' });
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

  const conversations = await models.Conversations.find({
    $or: [{ customerId: contentId }, { participatedUserIds: contentId }],
  }).lean();

  // Collect all unique integration IDs
  const integrationIds = [
    ...new Set(conversations.map((c) => c.integrationId)),
  ];

  // Fetch all integrations in one query
  const integrations = await models.Integrations.find({
    _id: { $in: integrationIds },
  }).lean();

  // Map integrations by _id for quick access
  const integrationMap = new Map(
    integrations.map((i) => [i._id.toString(), i]),
  );

  // Build results
  const results = conversations.map((c) => ({
    _id: c._id,
    contentType: 'inbox:conversation',
    contentId,
    createdAt: c.createdAt,
    contentTypeDetail: {
      integration: c.integrationId
        ? integrationMap.get(c.integrationId.toString())
        : undefined,
    },
  }));

  return results;
};
