import { APIUser } from 'discord-api-types/v10';
import { sendAutomationTrigger } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import { IDiscordCustomerDocument } from '@/integrations/discord/@types/customers';
import { IDiscordConversationDocument } from '@/integrations/discord/@types/conversations';
import {
  DiscordActivity,
  DiscordAttachment,
  DiscordEmbed,
  DiscordPoll,
} from '@/integrations/discord/@types/activity';
import {
  isIgnorableActivity,
  resolveDiscordMentions,
} from '@/integrations/discord/activity';
import {
  getChannel,
  getDiscordUser,
  getErrorMessage,
  isThreadChannel,
  rehostImageAttachments,
} from '@/integrations/discord/utils';
import { DISCORD_MESSAGE_TRIGGER_TYPE } from '@/integrations/discord/constants';
import { TDiscordTriggerTarget } from '@/integrations/discord/meta/automation/types';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';

const avatarUrl = (userId: string, hash?: string | null) =>
  hash ? `https://cdn.discordapp.com/avatars/${userId}/${hash}.png` : undefined;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const CUSTOMER_CREATE_ATTEMPTS = 4;

const CONVERSATION_LINK_ATTEMPTS = 4;

const syncCustomerToCore = async (
  subdomain: string,
  bot: IDiscordBotDocument,
  firstName?: string,
  avatar?: string,
) => {
  const response = await receiveInboxMessage(subdomain, {
    action: 'get-create-update-customer',
    payload: JSON.stringify({
      integrationId: bot.erxesApiId,
      firstName,
      avatar,
      isUser: true,
    }),
  });

  if (response.status !== 'success') {
    throw new Error(`Customer creation failed: ${JSON.stringify(response)}`);
  }

  return (response.data as { _id: string })._id;
};

const attemptGetOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
  activity: DiscordActivity,
  userId: string,
  attempt: number,
) => {
  const existing = await models.DiscordCustomers.findOne({ userId });

  if (existing?.erxesApiId) {
    return existing;
  }

  if (existing) {
    await sleep(250 * attempt);
    return undefined;
  }

  let profile: Partial<APIUser> = {};
  try {
    profile = (await getDiscordUser(bot.token, userId)) || {};
  } catch (e) {
    debugError(`Failed to fetch Discord user ${userId}: ${getErrorMessage(e)}`);
  }

  const firstName =
    profile.global_name || profile.username || activity.author.username;
  const avatar = avatarUrl(userId, profile.avatar);

  let customer;
  try {
    customer = await models.DiscordCustomers.create({
      userId,
      firstName,
      profilePic: avatar,
      integrationId: bot.erxesApiId,
    });
  } catch (e) {
    if (getErrorMessage(e).includes('duplicate')) {
      return undefined;
    }
    throw e;
  }
  try {
    customer.erxesApiId = await syncCustomerToCore(subdomain, bot, firstName, avatar);
    await customer.save();
  } catch (e) {
    await models.DiscordCustomers.deleteOne({ _id: customer._id });
    throw new Error(
      `Failed to sync Discord customer with API: ${getErrorMessage(e)}`,
    );
  }

  return customer;
};

const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
  activity: DiscordActivity,
) => {
  const userId = activity.author.id;

  for (let attempt = 1; attempt <= CUSTOMER_CREATE_ATTEMPTS; attempt++) {
    const customer = await attemptGetOrCreateCustomer(
      models,
      subdomain,
      bot,
      activity,
      userId,
      attempt,
    );

    if (customer) {
      return customer;
    }
  }

  const orphan = await models.DiscordCustomers.findOne({ userId });

  if (!orphan) {
    throw new Error(`Discord customer ${userId} could not be created`);
  }

  if (orphan.erxesApiId) {
    return orphan;
  }

  const erxesApiId = await syncCustomerToCore(
    subdomain,
    bot,
    orphan.firstName,
    orphan.profilePic,
  );

  const claimed = await models.DiscordCustomers.findOneAndUpdate(
    { _id: orphan._id, erxesApiId: null },
    { $set: { erxesApiId } },
    { new: true },
  );

  if (claimed) {
    return claimed;
  }

  const winner = await models.DiscordCustomers.findOne({ userId });

  if (winner?.erxesApiId) {
    return winner;
  }

  throw new Error(
    `Discord customer ${userId} could not be linked to a core contact`,
  );
};

const buildMessagePreview = (
  displayContent: string,
  poll?: DiscordPoll,
  embeds?: DiscordEmbed[],
) =>
  displayContent ||
  (poll ? poll.question || 'Poll' : '') ||
  embeds?.find((embed) => embed.title || embed.url)?.title ||
  (embeds?.length ? 'Link' : '');


const resolveDiscordChannelInfo = async (token: string, channelId: string) => {
  let channelName: string | undefined;
  let isThread = false;
  let parentChannelId: string | undefined;
  let parentChannelName: string | undefined;

  try {
    const channelInfo = await getChannel(token, channelId);
    channelName = channelInfo?.name ?? undefined;

    if (channelInfo && isThreadChannel(channelInfo) && channelInfo.parent_id) {
      isThread = true;
      parentChannelId = channelInfo.parent_id;
      try {
        parentChannelName =
          (await getChannel(token, channelInfo.parent_id))?.name ?? undefined;
      } catch (e) {
        debugError(
          `Failed to resolve Discord parent channel ${channelInfo.parent_id}: ${getErrorMessage(e)}`,
        );
      }
    }
  } catch (e) {
    debugError(
      `Failed to resolve Discord channel ${channelId}: ${getErrorMessage(e)}`,
    );
  }

  return { channelName, isThread, parentChannelId, parentChannelName };
};

const findOrCreateDiscordConversation = async (
  models: IModels,
  bot: IDiscordBotDocument,
  activity: DiscordActivity,
  displayContent: string,
) => {
  const { channelId, author, timestamp } = activity;

  let conversation = await models.DiscordConversations.findOne({
    channelId: { $eq: channelId },
  });

  if (conversation) {
    conversation.content = displayContent || '';
    return { conversation, createdInThisCall: false };
  }
  const { channelName, isThread, parentChannelId, parentChannelName } =
    await resolveDiscordChannelInfo(bot.token, channelId);

  try {
    conversation = await models.DiscordConversations.create({
      timestamp,
      channelId,
      channelName,
      isThread,
      parentChannelId,
      parentChannelName,
      authorId: author.id,
      guildId: activity.guildId,
      content: displayContent,
      integrationId: bot.erxesApiId,
    });
    return { conversation, createdInThisCall: true };
  } catch (e) {
    if (getErrorMessage(e).includes('duplicate')) {
      conversation = await models.DiscordConversations.findOne({
        channelId: { $eq: channelId },
      });
    }
    if (!conversation) {
      throw new Error(getErrorMessage(e));
    }
    return { conversation, createdInThisCall: false };
  }
};

const waitForConversationLink = async (
  models: IModels,
  conversation: IDiscordConversationDocument,
  createdInThisCall: boolean,
) => {
  if (createdInThisCall || conversation.erxesApiId) {
    return conversation;
  }

  for (let attempt = 1; attempt <= CONVERSATION_LINK_ATTEMPTS; attempt++) {
    await sleep(250 * attempt);
    const refreshed = await models.DiscordConversations.findById(
      conversation._id,
    );
    if (!refreshed) {
      break;
    }
    if (refreshed.erxesApiId) {
      return refreshed;
    }
  }

  return conversation;
};

const syncConversationToCore = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
  conversation: IDiscordConversationDocument,
  createdInThisCall: boolean,
  customer: IDiscordCustomerDocument,
  previewContent: string,
  storedAttachments: DiscordAttachment[],
  timestamp: Date,
) => {
  const isFirstSync = !conversation.erxesApiId;
  const owningIntegrationId =
    conversation.integrationId || (isFirstSync ? bot.erxesApiId : undefined);

  try {
    const data = {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        ...(isFirstSync ? { customerId: customer.erxesApiId } : {}),
        ...(owningIntegrationId ? { integrationId: owningIntegrationId } : {}),
        content: previewContent,
        attachments: storedAttachments,
        conversationId: conversation.erxesApiId,
        updatedAt: timestamp,
      }),
    };

    const response = await receiveInboxMessage(subdomain, data);

    if (response.status !== 'success') {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(response)}`,
      );
    }

    const mintedApiId = (response.data as { _id: string })._id;

    if (!isFirstSync) {
      conversation.erxesApiId = mintedApiId;
      await conversation.save();
      return conversation;
    }

    const claimed = await models.DiscordConversations.findOneAndUpdate(
      { _id: conversation._id, erxesApiId: null },
      { $set: { erxesApiId: mintedApiId } },
      { new: true },
    );

    if (claimed) {
      return claimed;
    }

    const winner = await models.DiscordConversations.findById(
      conversation._id,
    );
    if (winner?.erxesApiId) {
      return winner;
    }
    conversation.erxesApiId = mintedApiId;
    await conversation.save();
    return conversation;
  } catch (e) {
    if (createdInThisCall) {
      await models.DiscordConversations.deleteOne({ _id: conversation._id });
    }
    throw new Error(getErrorMessage(e));
  }
};

const persistAndDispatchMessage = async ({
  models,
  subdomain,
  bot,
  activity,
  conversation,
  customer,
  displayContent,
  storedAttachments,
  extraData,
  timestamp,
  skipAutomation,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
  activity: DiscordActivity;
  conversation: IDiscordConversationDocument;
  customer: IDiscordCustomerDocument;
  displayContent: string;
  storedAttachments: DiscordAttachment[];
  extraData: Record<string, unknown>;
  timestamp: Date;
  skipAutomation: boolean;
}) => {
  const { channelId, author, content, messageId } = activity;

  try {
    await models.DiscordConversationMessages.create({
      conversationId: conversation._id,
      messageId,
      createdAt: timestamp,
      content: displayContent,
      customerId: customer.erxesApiId,
      attachments: storedAttachments,
    });

    await receiveInboxMessage(subdomain, {
      action: 'create-conversation-message',
      metaInfo: 'replaceContent',
      payload: JSON.stringify({
        conversationId: conversation.erxesApiId,
        content: displayContent || '',
        customerId: customer.erxesApiId,
        createdAt: timestamp,
        attachments: storedAttachments,
        extraData,
      }),
    });

    debugDiscord(
      `Stored Discord message ${messageId} in conversation ${conversation.erxesApiId}`,
    );

    if (skipAutomation) {
      return;
    }

    const target: TDiscordTriggerTarget = {
      _id: messageId,
      content: content || '',
      conversationId: conversation.erxesApiId,
      customerId: customer.erxesApiId,
      channelId,
      guildId: activity.guildId,
      authorId: author.id,
      botId: bot._id,
      createdAt: timestamp,
    };

    sendAutomationTrigger(
      subdomain,
      {
        type: DISCORD_MESSAGE_TRIGGER_TYPE,
        targets: [target],
      },
      { transport: 'trpc' },
    );
  } catch (e) {
    throw new Error(
      getErrorMessage(e).includes('duplicate')
        ? 'Concurrent request: message duplication'
        : getErrorMessage(e),
    );
  }
};

export const receiveDiscordMessage = async ({
  models,
  subdomain,
  bot,
  activity,
  skipAutomation = false,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
  activity: DiscordActivity;
  skipAutomation?: boolean;
}) => {
  if (isIgnorableActivity(activity)) {
    return;
  }

  if (!bot.erxesApiId) {
    debugError(
      `Discord bot ${bot._id} has no linked inbox integration (erxesApiId); skipping message ${activity.messageId}`,
    );
    return;
  }

  const { messageId, content, attachments, poll, embeds } = activity;

  const displayContent = resolveDiscordMentions(content, activity.mentions);

  const storedAttachments = await rehostImageAttachments(subdomain, attachments);

  const extraData = {
    ...(poll && { poll }),
    ...(embeds?.length && { embeds }),
    discordMessageId: messageId,
  };
  const previewContent = buildMessagePreview(displayContent, poll, embeds);

  try {
    const customer = await getOrCreateCustomer(models, subdomain, bot, activity);

    const created = await findOrCreateDiscordConversation(
      models,
      bot,
      activity,
      displayContent,
    );

    let conversation = await waitForConversationLink(
      models,
      created.conversation,
      created.createdInThisCall,
    );

   
    const existingMessage = await models.DiscordConversationMessages.findOne({
      messageId: { $eq: messageId },
    });

    if (existingMessage) {
      return;
    }

    conversation = await syncConversationToCore(
      models,
      subdomain,
      bot,
      conversation,
      created.createdInThisCall,
      customer,
      previewContent,
      storedAttachments,
      activity.timestamp,
    );

    await persistAndDispatchMessage({
      models,
      subdomain,
      bot,
      activity,
      conversation,
      customer,
      displayContent,
      storedAttachments,
      extraData,
      timestamp: activity.timestamp,
      skipAutomation,
    });
  } catch (error) {
    throw new Error(
      `Error processing Discord message: ${getErrorMessage(error)}`,
    );
  }
};
