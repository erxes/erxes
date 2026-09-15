import { createHmac } from 'node:crypto';
import type { IAttachment } from 'erxes-api-shared/core-types';
import { getViberWebhookUrl } from '@/integrations/viber/config';
import { verifyViberSignature } from '@/integrations/viber/utils/signature';
import { readViberStoredFile } from './storage';

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
  return readViberStoredFile(subdomain, attachment.url);
};
