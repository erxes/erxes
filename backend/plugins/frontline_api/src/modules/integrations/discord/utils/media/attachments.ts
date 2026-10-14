import { randomUUID } from 'node:crypto';

import { promises as fsPromises } from 'node:fs';

import { tmpdir } from 'node:os';

import { basename, join } from 'node:path';

import { getEnv, uploadFileToStorage } from 'erxes-api-shared/utils';

import type { DiscordAttachment } from '@/integrations/discord/@types/activity';

import type { IDiscordConversationMessage } from '@/integrations/discord/@types/conversationMessages';

import { debugError } from '@/integrations/discord/debuggers';

import { getErrorMessage } from '@/integrations/discord/utils/request';

import { MAX_REHOST_IMAGE_BYTES } from '@/integrations/discord/constants/attachments';

export const resolveAttachmentUrl = (
  subdomain: string,
  urlOrKey: string,
): string => {
  if (urlOrKey.startsWith('http')) {
    return urlOrKey;
  }

  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  if (NODE_ENV === 'development') {
    const gatewayUrl = getEnv({
      name: 'GATEWAY_URL',
      subdomain,
      defaultValue: 'http://localhost:4000',
    });
    return `${gatewayUrl.replace(
      /\/$/,
      '',
    )}/pl:core/read-file?key=${encodeURIComponent(urlOrKey)}`;
  }

  return `${DOMAIN}/gateway/pl:core/read-file?key=${encodeURIComponent(
    urlOrKey,
  )}`;
};

export const filenameFromUrl = (url: string, index: number): string => {
  try {
    const { pathname } = new URL(url);
    const last = pathname.split('/').reverse().find(Boolean);
    return last || `attachment-${index}`;
  } catch {
    return `attachment-${index}`;
  }
};

const rehostImage = async (
  subdomain: string,
  attachment: DiscordAttachment,
): Promise<DiscordAttachment> => {
  if (attachment.size && attachment.size > MAX_REHOST_IMAGE_BYTES) {
    return attachment;
  }

  let tmpPath: string | undefined;
  try {
    const res = await fetch(attachment.url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength > MAX_REHOST_IMAGE_BYTES) {
      return attachment;
    }

    const fileName = basename(
      attachment.name || filenameFromUrl(attachment.url, 0),
    );
    tmpPath = join(tmpdir(), `discord-${randomUUID()}-${fileName}`);
    await fsPromises.writeFile(tmpPath, bytes);

    const key = await uploadFileToStorage({
      subdomain,
      filePath: tmpPath,
      fileName,
      mimetype: attachment.type,
    });

    return { ...attachment, url: key, size: bytes.byteLength };
  } catch (e) {
    debugError(
      `Failed to re-host Discord image ${
        attachment.url
      }, keeping CDN URL: ${getErrorMessage(e)}`,
    );
    return attachment;
  } finally {
    if (tmpPath) {
      await fsPromises.rm(tmpPath, { force: true }).catch(() => undefined);
    }
  }
};

export const rehostImageAttachments = (
  subdomain: string,
  attachments?: DiscordAttachment[],
): Promise<DiscordAttachment[]> => {
  if (!attachments?.length) {
    return Promise.resolve(attachments || []);
  }

  return Promise.all(
    attachments.map((attachment) =>
      attachment.type?.startsWith('image')
        ? rehostImage(subdomain, attachment)
        : Promise.resolve(attachment),
    ),
  );
};

/** Keep stored images by provider ID and re-host newly added or legacy images. */
export const rehostUpdatedImageAttachments = (
  subdomain: string,
  attachments: DiscordAttachment[],
  attachmentIds: string[],
  previousMessage: Pick<
    IDiscordConversationMessage,
    'attachments' | 'attachmentIds'
  >,
): Promise<DiscordAttachment[]> =>
  Promise.all(
    attachments.map((attachment, index) => {
      if (!attachment.type.startsWith('image')) {
        return Promise.resolve(attachment);
      }
      const attachmentId = attachmentIds[index];
      const previousIndex = attachmentId
        ? previousMessage.attachmentIds?.indexOf(attachmentId)
        : undefined;
      const stored =
        previousIndex !== undefined && previousIndex >= 0
          ? previousMessage.attachments?.[previousIndex]
          : undefined;
      if (
        stored?.url &&
        !/^https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\//i.test(
          stored.url,
        )
      ) {
        return Promise.resolve({ ...attachment, url: stored.url });
      }
      return rehostImage(subdomain, attachment);
    }),
  );
