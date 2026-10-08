import { timingSafeEqual } from 'node:crypto';

/** Compares equal-length UTF-8 secrets without content-dependent timing. */
export const verifyTelegramWebhookSecret = (
  expectedSecret: string,
  receivedSecret?: string,
): boolean => {
  if (!expectedSecret || !receivedSecret) {
    return false;
  }
  const expectedBytes = Buffer.from(expectedSecret, 'utf8');
  const receivedBytes = Buffer.from(receivedSecret, 'utf8');

  if (expectedBytes.length !== receivedBytes.length) {
    return false;
  }

  return timingSafeEqual(expectedBytes, receivedBytes);
};
