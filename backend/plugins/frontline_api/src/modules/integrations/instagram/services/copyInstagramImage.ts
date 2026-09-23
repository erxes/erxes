import type { IContext } from '~/connectionResolvers';
import { visibleChannelsFilter } from '@/channel/utils';
import { generateAttachmentUrl } from '@/integrations/instagram/commonUtils';
import { getEnv } from 'erxes-api-shared/utils';

export interface ICopyInstagramImageArgs {
  conversationId: string;
  messageId: string;
  url: string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const resolveCopySource = (url: string, subdomain: string): URL => {
  const storedKey = !/^https?:\/\//i.test(url);
  if (storedKey && (url.startsWith('/') || url.includes('..'))) {
    throw new Error('This image source cannot be copied');
  }
  const imageUrl = new URL(
    storedKey ? generateAttachmentUrl(subdomain, encodeURIComponent(url)) : url,
  );
  const domain = getEnv({ name: 'DOMAIN', subdomain });
  const storageDomain = domain ? new URL(domain) : null;
  const trustedStorageUrl =
    imageUrl.origin === storageDomain?.origin &&
    imageUrl.pathname.endsWith('/pl:core/read-file');
  const allowedHosts = [
    'fbcdn.net',
    'cdninstagram.com',
    'instagram.com',
    'fbsbx.com',
  ];
  const trustedMetaHost =
    imageUrl.protocol === 'https:' &&
    !imageUrl.port &&
    allowedHosts.some(
      (host) =>
        imageUrl.hostname.toLowerCase() === host ||
        imageUrl.hostname.toLowerCase().endsWith(`.${host}`),
    );
  if (
    imageUrl.username ||
    imageUrl.password ||
    (!trustedStorageUrl && !trustedMetaHost)
  ) {
    throw new Error('This image source cannot be copied');
  }
  return imageUrl;
};

const readImageAsDataUrl = async (response: Response): Promise<string> => {
  const contentType = response.headers.get('content-type')?.split(';')[0];
  if (
    !response.ok ||
    !contentType ||
    !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(
      contentType,
    )
  ) {
    throw new Error('Could not load this image');
  }
  if (Number(response.headers.get('content-length') || 0) > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large to copy');
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Could not load this image');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_BYTES) throw new Error('Image is too large to copy');
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  return `data:${contentType};base64,${Buffer.concat(chunks).toString(
    'base64',
  )}`;
};

export const copyInstagramImage = async (
  { conversationId, messageId, url }: ICopyInstagramImageArgs,
  context: IContext,
): Promise<string> => {
  const { models, user, checkPermission, subdomain } = context;
  if (!user?._id) throw new Error('Authentication required');
  await checkPermission('showConversations');

  const conversation = await models.Conversations.getConversation(
    conversationId,
  );
  const integration = await models.Integrations.getIntegration({
    _id: conversation.integrationId,
  });
  if (integration.kind !== 'instagram-messenger' || !integration.channelId) {
    throw new Error('Instagram conversation not found');
  }
  const visibleChannels = await visibleChannelsFilter(context);
  if (
    !(await models.Channels.exists({
      $and: [{ _id: integration.channelId }, visibleChannels],
    }))
  ) {
    throw new Error('You do not have access to this conversation');
  }
  const instagramConversation = await models.InstagramConversations.findOne({
    erxesApiId: conversationId,
  });
  const message =
    instagramConversation &&
    (await models.InstagramConversationMessages.findOne({
      _id: messageId,
      conversationId: instagramConversation._id,
    }));
  const attachment = message?.attachments?.find(
    (item: { url: string; type: string }) =>
      item.url === url &&
      (item.type?.startsWith('image') || item.type === 'sticker'),
  );
  if (!attachment) throw new Error('Image unavailable');

  const response = await fetch(resolveCopySource(url, subdomain), {
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
  });
  return readImageAsDataUrl(response);
};
