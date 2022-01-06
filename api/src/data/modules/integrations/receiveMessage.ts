import {
  ConversationMessages,
  Conversations,
  Customers,
  EmailDeliveries,
  EngageMessages,
  Integrations,
  Users
} from '../../../db/models';
import { CONVERSATION_STATUSES } from '../../../db/models/definitions/constants';
import { graphqlPubsub } from '../../../pubsub';
import { AWS_EMAIL_STATUSES, EMAIL_VALIDATION_STATUSES } from '../../constants';
import { getConfigs } from '../../utils';

const sendError = message => ({
  status: 'error',
  errorMessage: message
});

const sendSuccess = data => ({
  status: 'success',
  data
});

/*
 * Handle requests from integrations api
 */
export const receiveRpcMessage = async msg => {
  const { action, metaInfo, payload } = msg;
  const doc = JSON.parse(payload || '{}');

  if (action === 'get-create-update-customer') {
    const integration = await Integrations.findOne({
      _id: doc.integrationId
    });

    if (!integration) {
      return sendError(`Integration not found: ${doc.integrationId}`);
    }

    const { primaryEmail, primaryPhone } = doc;

    let customer;

    const getCustomer = async selector => Customers.findOne(selector).lean();

    if (primaryPhone) {
      customer = await getCustomer({ primaryPhone });

      if (customer) {
        await Customers.updateCustomer(customer._id, doc);
        return sendSuccess({ _id: customer._id });
      }
    }

    if (primaryEmail) {
      customer = await getCustomer({ primaryEmail });
    }

    if (customer) {
      return sendSuccess({ _id: customer._id });
    } else {
      customer = await Customers.createCustomer({
        ...doc,
        scopeBrandIds: integration.brandId
      });
    }

    return sendSuccess({ _id: customer._id });
  }

  if (action === 'create-or-update-conversation') {
    const { conversationId, content, owner } = doc;

    let user;

    if (owner) {
      user = await Users.findOne({ 'details.operatorPhone': owner });
    }

    const assignedUserId = user ? user._id : null;

    if (conversationId) {
      await Conversations.updateConversation(conversationId, {
        content,
        assignedUserId
      });

      return sendSuccess({ _id: conversationId });
    }

    doc.assignedUserId = assignedUserId;

    const conversation = await Conversations.createConversation(doc);

    return sendSuccess({ _id: conversation._id });
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
      readUserIds: []
    };

    if (message.content && metaInfo === 'replaceContent') {
      conversationDoc.content = message.content;
    }

    if (doc.createdAt) {
      conversationDoc.updatedAt = doc.createdAt;
    }

    await Conversations.updateConversation(
      message.conversationId,
      conversationDoc
    );

    graphqlPubsub.publish('conversationClientMessageInserted', {
      conversationClientMessageInserted: message
    });

    graphqlPubsub.publish('conversationMessageInserted', {
      conversationMessageInserted: message
    });

    return sendSuccess({ _id: message._id });
  }

  if (action === 'get-configs') {
    const configs = await getConfigs();
    return sendSuccess({ configs });
  }

  if (action === 'getUserIds') {
    const users = await Users.find({}, { _id: 1 });
    return sendSuccess({ userIds: users.map(user => user._id) });
  }
};

/*
 * Integrations api notification
 */
export const receiveIntegrationsNotification = async msg => {
  const { action } = msg;

  if (action === 'external-integration-entry-added') {
    graphqlPubsub.publish('conversationExternalIntegrationMessageInserted', {});

    return sendSuccess({ status: 'ok' });
  }

  if (action === 'sync-calendar-event') {
    graphqlPubsub.publish('calendarEventUpdated', {});

    return sendSuccess({ status: 'ok' });
  }
};

/**
 * Remove engage conversations
 */
export const removeEngageConversations = async _id => {
  await Conversations.removeEngageConversations(_id);
};

/*
 * Engages notification
 */
export const receiveEngagesNotification = async msg => {
  const { action, data } = msg;

  if (action === 'setSubscribed') {
    const { customerId, status, customerIds = [] } = data;
    const update: any = { isSubscribed: 'No' };

    if (status === AWS_EMAIL_STATUSES.BOUNCE) {
      update.emailValidationStatus = EMAIL_VALIDATION_STATUSES.INVALID;
    }

    if (customerId) {
      await Customers.updateOne({ _id: customerId }, { $set: update });
    }
    if (customerIds.length > 0 && !status) {
      await Customers.updateMany(
        { _id: { $in: customerIds } },
        { $set: update }
      );
    }
  }

  if (action === 'transactionEmail') {
    await EmailDeliveries.updateEmailDeliveryStatus(
      data.emailDeliveryId,
      data.status
    );
  }

  if (action === 'setCampaignCount') {
    const { campaignId, totalCustomersCount, validCustomersCount } = data;

    const campaign = await EngageMessages.findOne({ _id: campaignId });

    if (campaign) {
      await EngageMessages.updateOne(
        { _id: campaignId },
        {
          $set: {
            totalCustomersCount,
            validCustomersCount,
            lastRunAt: new Date()
          },
          $inc: { runCount: 1 }
        }
      );
    }
  }
};
