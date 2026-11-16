import { hmacSha256, safeEqual } from '~/lib/crypto';
import { coreKey } from '~/lib/secrets';

/**
 * A recipient's own addresses: unsubscribe, the open pixel and tracked links.
 * Each carries the recipient's id and a signature over it, so nobody can
 * unsubscribe or count an open for a recipient they weren't sent; a tracked
 * link also signs its target, so the address can't redirect anywhere else.
 */
const key = () => coreKey('erxes-broadcast-links-v1');

const sign = (value: string) => hmacSha256(key(), value, 'base64url');

const recipientSignature = (recipientId: string) => sign(`r:${recipientId}`);

export const isRecipientSignature = (recipientId: string, signature: string) =>
  safeEqual(signature, recipientSignature(recipientId));

const targetSignature = (recipientId: string, target: string) => sign(`t:${recipientId}:${target}`);

export const isTargetSignature = (recipientId: string, target: string, signature: string) =>
  safeEqual(signature, targetSignature(recipientId, target));

/** The paths under `APP_URL` (the API answers `/core/v1` on the same origin). */
export const recipientPaths = (recipientId: string) => {
  const base = `/core/v1/b/${recipientId}/${recipientSignature(recipientId)}`;

  return {
    unsubscribe: `${base}/unsubscribe`,
    open: `${base}/open.gif`,
    click: (target: string) =>
      `${base}/click?u=${encodeURIComponent(target)}&s=${targetSignature(recipientId, target)}`,
  };
};
