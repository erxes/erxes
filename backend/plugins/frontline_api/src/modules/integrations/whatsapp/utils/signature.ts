import { createHmac, timingSafeEqual } from 'node:crypto';

/** Verifies Meta's X-Hub-Signature-256 header against the raw request body. */
export const hasValidWhatsappSignature = (
  rawBody: Buffer | undefined,
  signature: string | undefined,
  appSecret: string,
): boolean => {
  if (!rawBody || !signature || !appSecret) return false;

  const expected = Buffer.from(
    `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`,
  );
  const received = Buffer.from(signature);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
};

/** Compares a webhook verify token without leaking its length-prefix timing. */
export const isWhatsappVerifyToken = (
  received: unknown,
  verifyToken: string,
): boolean => {
  if (typeof received !== 'string' || !verifyToken) return false;

  const expected = Buffer.from(verifyToken);
  const actual = Buffer.from(received);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
};
