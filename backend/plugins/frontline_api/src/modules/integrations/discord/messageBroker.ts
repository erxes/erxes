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

/**
 * Entry point for inbox→Discord requests, dispatched from
 * `dispatchConversationToService` (serviceName 'discord'). Mirrors Facebook's
 * `handleFacebookIntegration`.
 */
export async function handleDiscordIntegration({
  subdomain,
  data,
}: {
  subdomain: string;
  data: { type: string; action: string; payload: string; integrationId: string };
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

/**
 * Canonical integration-creation handler, dispatched from the inbox's
 * `sendCreateIntegration` after core has created the inbox Integration. Mirrors
 * `facebookCreateIntegrations`: creates the DiscordBot mirror linked by
 * `erxesApiId = integrationId` and validates the token. If creation fails the
 * inbox mutation rolls back the integration it created.
 */
export async function discordCreateIntegrations({
  subdomain,
  data,
}: {
  subdomain: string;
  data: { integrationId: string; kind: string; data?: string };
}) {
  const models = await generateModels(subdomain);

  // The connect wizard's integration `data` payload (JSON over the broker).
  type TDiscordIntegrationDetails = {
    name?: string;
    token?: string;
    applicationId?: string;
    guildId?: string;
    guildName?: string;
    channelId?: string;
  };

  let details: TDiscordIntegrationDetails = {};
  try {
    details = JSON.parse(data.data || '{}');
  } catch {
    details = {};
  }

  const { name, token, applicationId, guildId, guildName, channelId } = details;

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

    // Surface token validity via health (does not block creation).
    const validated = await models.DiscordBots.validateConnection(bot._id);

    // Connect-on-create: open the Gateway immediately so the bot starts
    // receiving messages without waiting for the distributor cycle or a restart.
    await connectDiscordBot(subdomain, validated);

    // Auto-backfill recent history (last 100 messages + active threads) so chats
    // written before the bot connected show up in the inbox. Runs in the
    // background so it never blocks integration setup; idempotent on message id.
    if (validated?.health?.isTokenValid) {
      backfillChannelHistory({ models, subdomain, bot: validated }).catch((e) =>
        debugError(`Discord history backfill failed: ${(e as Error).message}`),
      );
    }

    return { status: 'success' };
  } catch (e) {
    return { status: 'error', errorMessage: getErrorMessage(e) };
  }
}

/**
 * Removal handler, dispatched from the inbox's `sendRemoveIntegration`. Mirrors
 * `facebookRemoveIntegrations`: closes the bot's live Gateway connection and
 * deletes the bot + its local mirror (conversations/customers/messages). The
 * inbox Integration itself is removed by the caller (`integrationsRemove`), so
 * we deliberately don't touch it here.
 */
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
  // The inbox Integration is deleted by the caller, but its membership in
  // inbox channels (pushed on create) and its inbox conversations aren't —
  // clean both so no channel points at the removed integration and no leftover
  // conversation can later fire an automation with no resolvable bot.
  await models.DiscordBots.detachIntegrationsFromChannels([integrationId]);
  await models.DiscordBots.removeInboxConversations([integrationId]);
  await models.DiscordBots.deleteOne({ _id: bot._id });

  // Close the shared Gateway socket only when no other channel-integration
  // still uses this token; otherwise the remaining channels keep flowing.
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

/**
 * Repair handler, dispatched from the inbox's `sendRepairIntegration`. Re-checks
 * the bot token (refreshing `health`) and re-opens the Gateway connection — the
 * Discord analogue of Facebook's page re-subscription.
 */
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

  // Re-validate the token (refreshes health), then reconnect its Gateway socket.
  await models.DiscordBots.validateConnection(bot._id);

  try {
    await disconnectDiscordToken(subdomain, bot.token);
    await connectDiscordToken(subdomain, bot.token);
  } catch (e) {
    debugError(`Failed to reconnect Discord token: ${getErrorMessage(e)}`);
  }

  return { status: 'success' };
}
