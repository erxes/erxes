import {
  buildSkippedAction,
  IAutomationAction,
  IAutomationExecution,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import { HUMAN_AGENT_MESSENGER_TAG } from '@/integrations/facebook/messageActions';
import { TAutomationActionConfig } from '@/integrations/facebook/meta/automation/types/automationTypes';
import { IModels } from '~/connectionResolvers';
import {
  generateMessages,
  resolveMessageActionConfigTemplates,
  sendMessage,
} from './utils';

const HOUR_MS = 60 * 60 * 1000;
const STANDARD_WINDOW_MS = 24 * HOUR_MS;
// Meta allows a person's reply with the HUMAN_AGENT tag this long after the
// customer's last message
const HUMAN_AGENT_WINDOW_MS = 7 * 24 * HOUR_MS;

export const CUSTOMER_MESSAGE_COLLECTION = 'customerMessages';

/**
 * How a message may reach the customer now: freely within a day of their
 * last message, with the HUMAN_AGENT tag within a week, not at all after.
 */
export const customerMessageRoute = (
  lastInboundAt: Date | undefined,
  now = Date.now(),
): { allowed: false } | { allowed: true; tag?: string } => {
  if (!lastInboundAt) {
    return { allowed: false };
  }

  const age = now - lastInboundAt.getTime();

  if (age < STANDARD_WINDOW_MS) {
    return { allowed: true };
  }

  return age < HUMAN_AGENT_WINDOW_MS
    ? { allowed: true, tag: HUMAN_AGENT_MESSENGER_TAG }
    : { allowed: false };
};

// The run's record names its customer; a customer trigger is the customer
const customerIdOf = (execution: IAutomationExecution) => {
  const target = (execution.target || {}) as {
    _id?: string;
    customerId?: string;
  };

  if (target.customerId) {
    return String(target.customerId);
  }

  return execution.triggerType === 'core:contacts.customers' && target._id
    ? String(target._id)
    : '';
};

/**
 * The customer's latest Messenger conversation, on the chosen page when one
 * is set: where a message about their ticket or order goes.
 */
export const findCustomerConversation = async (
  models: IModels,
  customerId: string,
  botId?: string,
) => {
  const facebookCustomers = await models.FacebookCustomers.find(
    { erxesApiId: customerId },
    { userId: 1 },
  ).lean();
  const psids = facebookCustomers.map(({ userId }) => userId).filter(Boolean);

  if (!psids.length) {
    return null;
  }

  return models.FacebookConversations.findOne({
    senderId: { $in: psids },
    ...(botId ? { botId } : {}),
  })
    .sort({ updatedAt: -1 })
    .lean();
};

/**
 * Sends a message to the customer of any record (a ticket, a customer) on
 * Messenger, outside a Messenger run: ticket updates, decisions, a rating
 * link. Every refusal is a visible skip, never a silent success.
 */
export const actionMessageCustomer = async ({
  models,
  subdomain,
  action,
  execution,
}: {
  models: IModels;
  subdomain: string;
  action: IAutomationAction<TAutomationActionConfig>;
  execution: { _id: string } & IAutomationExecution;
}) => {
  const config = (action.config || {}) as TAutomationActionConfig & {
    botId?: string;
  };
  const customerId = customerIdOf(execution);

  if (!customerId) {
    return buildSkippedAction('no-customer');
  }

  const conversation = await findCustomerConversation(
    models,
    customerId,
    config.botId,
  );

  if (!conversation?.botId) {
    return buildSkippedAction('no-messenger-conversation');
  }

  const latestInbound = await models.FacebookConversationMessages.findOne(
    {
      conversationId: conversation._id,
      customerId: { $exists: true, $ne: null },
      fromBot: { $ne: true },
      userId: { $exists: false },
    },
    { createdAt: 1 },
  )
    .sort({ createdAt: -1 })
    .lean();
  const lastInboundAt = latestInbound?.createdAt
    ? new Date(latestInbound.createdAt)
    : undefined;
  const route = customerMessageRoute(lastInboundAt);

  if (!route.allowed) {
    return buildSkippedAction('outside-7-days', { lastInboundAt });
  }

  const [bot, integration, customer] = await Promise.all([
    models.FacebookBots.findOne({ _id: conversation.botId }),
    models.FacebookIntegrations.findOne({ _id: conversation.integrationId }),
    models.FacebookCustomers.findOne({ userId: conversation.senderId }),
  ]);

  if (!bot || !integration || !customer) {
    return buildSkippedAction('messenger-page-unavailable');
  }

  const resolved = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: { config },
    keepUnresolvedPlaceholders: true,
  });
  const messages = await generateMessages({
    subdomain,
    conversation,
    customer,
    executionId: execution._id,
    actionId: action.id,
    config: resolveMessageActionConfigTemplates(
      resolved.config as TAutomationActionConfig,
      { prevAction: execution.actions?.at(-1)?.result },
    ),
  });

  if (!messages?.length) {
    throw new Error('There are no generated messages to send.');
  }

  const sent: { _id: string }[] = [];

  for (const { botData, ...message } of messages) {
    const result = await sendMessage(models, bot, {
      senderId: conversation.senderId,
      recipientId: conversation.recipientId,
      integration,
      message,
      tag: route.tag,
      skipTyping: true,
    });

    if (!result) {
      throw new Error('Messenger did not accept the message');
    }

    if (conversation.erxesApiId) {
      sent.push(
        await models.FacebookConversationMessages.addBotMessage(subdomain, {
          conversationId: conversation._id,
          botId: conversation.botId,
          botData,
          mid: result.message_id || result.mid,
          conversationErxesApiId: conversation.erxesApiId,
        }),
      );
    }
  }

  return {
    conversationId: conversation.erxesApiId,
    tag: route.tag || null,
    messageIds: sent.map(({ _id }) => _id),
  };
};
