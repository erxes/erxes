import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verifies the `X-Hub-Signature-256` header Meta sends with every webhook.
 *
 * Shared by every Meta-backed channel — WhatsApp, Messenger and Instagram all
 * receive the same signature scheme from the same Graph API, differing only in
 * which app secret keys it. Each channel used to carry its own byte-identical
 * copy of this.
 *
 * The digest is HMAC-SHA256 of the RAW request body keyed with the app secret,
 * hex-encoded and prefixed `sha256=`. Re-serialising the parsed JSON produces
 * different bytes and will not match, so the raw buffer is required: it comes
 * from the `verify` hook on the host's `express.json` in
 * erxes-api-shared/utils/start-plugin.ts, which sets `req.rawBody`.
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started
 *
 * Returns false rather than throwing so the caller decides the response code,
 * and uses a constant-time comparison so a mismatch cannot be probed by timing.
 *
 * @param rawBody - the unparsed request body
 * @param signatureHeader - value of the `X-Hub-Signature-256` header
 * @param appSecret - the Meta app secret for the channel being verified
 */
export const verifyMetaWebhookSignature = (
  rawBody: Buffer | string | undefined,
  signatureHeader: string | undefined,
  appSecret: string | undefined,
): boolean => {
  if (!appSecret) {
    // Nothing to verify against. Treated as a failure by callers that require
    // a signature, so a misconfigured integration cannot silently accept
    // unauthenticated webhooks.
    return false;
  }

  if (!rawBody || !signatureHeader?.startsWith('sha256=')) {
    return false;
  }

  const expected = createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  const received = signatureHeader.slice('sha256='.length);

  const expectedBuffer = Buffer.from(expected, 'utf8');
  const receivedBuffer = Buffer.from(received, 'utf8');

  // timingSafeEqual throws when lengths differ, which itself leaks length —
  // check first, then compare in constant time.
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
};
