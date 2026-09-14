import { getEnv, sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IContext } from '~/connectionResolvers';
import { getViberMediaAllowedHostnames, getViberWebhookUrl } from './config';
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
      'Configure an HTTPS VIBER_RECEIVE_URL or DOMAIN on the Frontline server.';
  }
  try {
    mediaHostnames = getViberMediaAllowedHostnames(context.subdomain);
    if (!mediaHostnames.length) {
      mediaError =
        'Incoming media is blocked until the deployment administrator approves Viber media hosts in VIBER_MEDIA_ALLOWED_HOSTNAMES.';
    }
  } catch {
    mediaError = 'VIBER_MEDIA_ALLOWED_HOSTNAMES contains an invalid hostname.';
  }
  try {
    const configs: unknown = await sendTRPCMessage({
      subdomain: context.subdomain,
      pluginName: 'core',
      module: 'configs',
      action: 'getConfigs',
      method: 'query',
      input: { codes: ['UPLOAD_SERVICE_TYPE', 'CLOUDFLARE_USE_CDN'] },
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
        'Viber attachments require supported remote file storage in Settings → File Upload. LOCAL uploads are not supported.';
    }
    const useCdn =
      configs && typeof configs === 'object' && 'CLOUDFLARE_USE_CDN' in configs
        ? configs.CLOUDFLARE_USE_CDN
        : getEnv({ name: 'CLOUDFLARE_USE_CDN', defaultValue: '' });
    if (
      storageProvider === 'CLOUDFLARE' &&
      String(useCdn).toLowerCase() === 'true'
    ) {
      storageError =
        'Viber requires readable object-storage keys. Cloudflare Images/Stream CDN uploads are not supported by the shared file-stream API; use R2 object storage with CDN uploads disabled.';
    }
  } catch {
    storageError =
      'File storage configuration could not be read. Check the Core service.';
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
    integration.isActive === false
      ? 'This Viber integration is archived. Restore it before replying.'
      : !mapping || !connection
      ? 'This conversation has no usable Viber connection or recipient mapping.'
      : subscription?.subscribed === false
      ? 'This customer has unsubscribed. Wait for them to subscribe or message the bot again.'
      : null;
  return {
    canSend: !reason,
    reason,
    subscribed: subscription?.subscribed ?? null,
  };
};
