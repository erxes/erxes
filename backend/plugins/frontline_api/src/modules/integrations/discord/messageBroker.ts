import { generateModels } from '~/connectionResolvers';
import { handleDiscordMessage } from '@/integrations/discord/handleDiscordMessage';
import { getErrorMessage, sanitizeToken } from '@/integrations/discord/utils';
import {
  connectDiscordBot,
  connectDiscordToken,
  disconnectDiscordToken,
} from '@/integrations/discord/initApp';
import { backfillChannelHistory } from '@/integrations/discord/backfill';
import { debugError } from '@/integrations/discord/debuggers';

export async function handleDiscordIntegration({
  subdomain,
  data,
}: {
  subdomain: string;
  data: {
    type: string;
    action: string;
    payload: string;
    integrationId: string;
  };
}) {
  const models = await generateModels(subdomain);
  const { type } = data;

  let response: {
    status: 'success' | 'error';
    data?: unknown;
    errorMessage?: string;
  } = { status: 'success' };

  try {
    if (type === 'discord') {
      response.data = await handleDiscordMessage(models, data, subdomain);
    }
  } catch (e) {
    response = { status: 'error', errorMessage: getErrorMessage(e) };
  }

  return response;
}

export async function discordCreateIntegrations({
  subdomain,
  data,
}: {
  subdomain: string;
  data: { integrationId: string; kind: string; data?: string };
}) {
  const models = await generateModels(subdomain);

  type TDiscordIntegrationDetails = {
    name?: string;
    token?: string;
    applicationId?: string;
    guildId?: string;
    guildName?: string;
    channelId?: string;
    sourceBotId?: string;
  };

  let details: TDiscordIntegrationDetails = {};
  try {
    details = JSON.parse(data.data || '{}');
  } catch {
    details = {};
  }

  let { token, applicationId, guildId, guildName } = details;
  const { name, channelId, sourceBotId } = details;

  if (!token && sourceBotId) {
    const sourceBot = await models.DiscordBots.findById(sourceBotId);
    if (!sourceBot) {
      return {
        status: 'error',
        errorMessage: `Source Discord bot ${sourceBotId} not found`,
      };
    }
    token = sourceBot.token;
    applicationId = applicationId || sourceBot.applicationId;
    guildId = guildId || sourceBot.guildId;
    guildName = guildName || sourceBot.guildName;
  }

  try {
    const bot = await models.DiscordBots.create({
      name: (name || 'Discord bot').trim(),
      token: sanitizeToken(token),
      applicationId: (applicationId || '').trim(),
      guildId: guildId ? String(guildId).trim() : undefined,
      guildName: guildName ? String(guildName).trim() : undefined,
      channelId: channelId ? String(channelId).trim() : undefined,
      erxesApiId: data.integrationId,
      health: { status: 'syncing' },
    });

    try {
      const validated = await models.DiscordBots.validateConnection(bot._id);

      await connectDiscordBot(subdomain, validated);

      if (validated?.health?.isTokenValid) {
        backfillChannelHistory({ models, subdomain, bot: validated }).catch(
          (e) =>
            debugError(
              `Discord history backfill failed: ${(e as Error).message}`,
            ),
        );
      }
    } catch (e) {
      await models.DiscordBots.deleteOne({ _id: bot._id }).catch(
        (deleteError) =>
          debugError(
            `Failed to roll back Discord bot ${bot._id}: ${getErrorMessage(
              deleteError,
            )}`,
          ),
      );
      throw e;
    }

    return { status: 'success' };
  } catch (e) {
    return { status: 'error', errorMessage: getErrorMessage(e) };
  }
}

export async function discordRemoveIntegrations({
  subdomain,
  data,
}: {
  subdomain: string;
  data: { integrationId: string };
}) {
  const models = await generateModels(subdomain);
  const { integrationId } = data;

  const bot = await models.DiscordBots.findOne({ erxesApiId: integrationId });

  if (!bot) {
    return { status: 'success' };
  }

  const { token } = bot;

  const conversationIds = await models.DiscordConversations.find({
    integrationId,
  }).distinct('_id');

  await models.DiscordCustomers.deleteMany({ integrationId });
  await models.DiscordConversations.deleteMany({ integrationId });
  await models.DiscordConversationMessages.deleteMany({
    conversationId: { $in: conversationIds },
  });
  await models.DiscordBots.detachIntegrationsFromChannels([integrationId]);
  await models.DiscordBots.removeInboxConversations([integrationId]);
  await models.DiscordBots.deleteOne({ _id: bot._id });

  try {
    const remaining = await models.DiscordBots.countDocuments({ token });
    if (remaining === 0) {
      await disconnectDiscordToken(subdomain, token);
    }
  } catch (e) {
    debugError(`Failed to disconnect Discord token: ${getErrorMessage(e)}`);
  }

  return { status: 'success' };
}

export async function discordRepairIntegrations({
  subdomain,
  data,
}: {
  subdomain: string;
  data: { integrationId: string };
}) {
  const models = await generateModels(subdomain);

  const bot = await models.DiscordBots.findOne({
    erxesApiId: data.integrationId,
  });

  if (!bot) {
    return { status: 'error', errorMessage: 'Discord bot not found' };
  }

  await models.DiscordBots.validateConnection(bot._id);

  try {
    await disconnectDiscordToken(subdomain, bot.token);
    await connectDiscordToken(subdomain, bot.token);
  } catch (e) {
    debugError(`Failed to reconnect Discord token: ${getErrorMessage(e)}`);
  }

  return { status: 'success' };
}
