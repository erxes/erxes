import { createHmac } from 'node:crypto';
import type { IAttachment } from 'erxes-api-shared/core-types';
import { readFileStreamFromStorage } from 'erxes-api-shared/utils';
import { getViberWebhookUrl } from '@/integrations/viber/config';
import { verifyViberSignature } from '@/integrations/viber/utils/signature';

export const VIBER_MEDIA_LINK_LIFETIME_SECONDS = 3600;

export const viberMediaSignatureBody = (
  subdomain: string,
  inboxId: string,
  messageId: string,
  index: number,
  name: string,
  expires: number,
): Buffer =>
  Buffer.from(
    JSON.stringify([
      'viber-outbound-media',
      subdomain,
      inboxId,
      messageId,
      index,
      name,
      expires,
    ]),
  );

export const getViberOutboundMediaUrl = (
  subdomain: string,
  inboxId: string,
  token: string,
  messageId: string,
  index: number,
  name: string,
): string => {
  const expires =
    Math.floor(Date.now() / 1000) + VIBER_MEDIA_LINK_LIFETIME_SECONDS;
  const signature = createHmac('sha256', token)
    .update(
      viberMediaSignatureBody(
        subdomain,
        inboxId,
        messageId,
        index,
        name,
        expires,
      ),
    )
    .digest('hex');
  return `${getViberWebhookUrl(subdomain, inboxId)}/media/${encodeURIComponent(
    messageId,
  )}/${index}/${encodeURIComponent(
    name,
  )}?expires=${expires}&signature=${signature}`;
};

export const verifyViberMediaLink = (
  subdomain: string,
  inboxId: string,
  token: string,
  messageId: string,
  index: number,
  name: string,
  expires: number,
  signature: string,
): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return (
    Number.isSafeInteger(index) &&
    index >= 0 &&
    Number.isSafeInteger(expires) &&
    expires > now &&
    expires <= now + VIBER_MEDIA_LINK_LIFETIME_SECONDS &&
    verifyViberSignature(
      token,
      viberMediaSignatureBody(
        subdomain,
        inboxId,
        messageId,
        index,
        name,
        expires,
      ),
      signature,
    )
  );
};

export const readViberStoredAttachment = async (
  subdomain: string,
  attachment: IAttachment,
): Promise<Buffer> => {
  const stream = await readFileStreamFromStorage({
    subdomain,
    key: attachment.url,
  });
  const timer = setTimeout(
    () => stream.destroy(new Error('Viber attachment read timed out')),
    30_000,
  );
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const chunk of stream) {
      if (!Buffer.isBuffer(chunk))
        throw new Error('Invalid Viber attachment stream');
      size += chunk.length;
      if (size > attachment.size || size > 50 * 1024 * 1024)
        throw new Error('Viber attachment exceeds its declared size');
      chunks.push(chunk);
    }
    if (size !== attachment.size || size === 0)
      throw new Error('Viber attachment size does not match the stored file');
    return Buffer.concat(chunks, size);
  } finally {
    clearTimeout(timer);
    stream.destroy();
  }
};
