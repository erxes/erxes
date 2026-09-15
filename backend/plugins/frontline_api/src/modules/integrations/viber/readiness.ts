import { getEnv, sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import { getViberWebhookUrl } from './config';
import { resolveViberMediaSettings } from './settings';
import { assertViberConversationAccess } from './access';

// Configuration readiness is not a provider or storage round-trip test.
export const getViberSetup = async (context: IContext) => {
  if (!context.user?._id) throw new Error('Authentication required');
  await context.checkPermission('showIntegrations');
  let webhookUrl: string | null = null;
  let webhookError: string | null = null;
  let mediaHostnames: readonly string[] = [];
  let mediaError: string | null = null;
  let storageProvider: string | null = null;
  let storageError: string | null = null;
  try {
    webhookUrl = getViberWebhookUrl(context.subdomain, 'INTEGRATION_ID');
  } catch {
    webhookError =
      'Ask your administrator to configure a public HTTPS webhook URL.';
  }
  try {
    mediaHostnames = (
      await resolveViberMediaSettings(context.models, context.subdomain)
    ).hostnames;
    if (!mediaHostnames.length) {
      mediaError =
        'Incoming media is unavailable. Ask your administrator to approve Viber media hosts.';
    }
  } catch {
    mediaError = 'The media host list is invalid. Contact your administrator.';
  }
  try {
    const configs: unknown = await sendTRPCMessage({
      subdomain: context.subdomain,
      pluginName: 'core',
      module: 'configs',
      action: 'getConfigs',
      method: 'query',
      input: { codes: ['UPLOAD_SERVICE_TYPE'] },
      throwOnError: true,
    });
    const configured =
      configs && typeof configs === 'object' && 'UPLOAD_SERVICE_TYPE' in configs
        ? configs.UPLOAD_SERVICE_TYPE
        : undefined;
    storageProvider = (
      typeof configured === 'string'
        ? configured
        : getEnv({ name: 'UPLOAD_SERVICE_TYPE', defaultValue: 'AWS' })
    ).toUpperCase();
    if (!['AWS', 'GCS', 'CLOUDFLARE', 'AZURE'].includes(storageProvider)) {
      storageError =
        'Choose cloud storage in File Upload settings. Local storage is not supported for Viber attachments.';
    }
  } catch {
    storageError = 'Unable to load storage settings. Try again.';
  }
  return {
    webhookUrl,
    webhookError,
    mediaHostnames,
    mediaError,
    storageProvider,
    storageError,
  };
};

export const getViberConversationState = async (
  context: IContext,
  conversationId: string,
) => {
  const { integration } = await assertViberConversationAccess(
    context,
    conversationId,
    'showConversations',
  );
  const mapping = await context.models.ViberConversations.findOne({
    inboxId: integration._id,
    conversationId,
  });
  const subscription = mapping
    ? await context.models.ViberSubscriptions.findOne({
        inboxId: integration._id,
        userId: mapping.userId,
      })
    : null;
  const connection = await context.models.ViberIntegrations.findOne({
    inboxId: integration._id,
  });
  const reason =
    !mapping || !connection
      ? 'This conversation is no longer linked to a Viber bot.'
      : subscription?.subscribed === false
      ? 'This customer has unsubscribed. Replies are paused until they subscribe again.'
      : null;
  return {
    canSend: !reason,
    reason,
    subscribed: subscription?.subscribed ?? null,
  };
};
