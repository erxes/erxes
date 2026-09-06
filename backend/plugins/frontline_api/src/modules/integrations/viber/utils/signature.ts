import { createHmac, timingSafeEqual } from 'node:crypto';

export const verifyViberSignature = (
  token: string,
  rawBody: Buffer,
  receivedSignature?: string,
): boolean => {
  if (!token) {
    return false;
  }

  if (!receivedSignature || !/^[a-fA-F0-9]{64}$/.test(receivedSignature)) {
    return false;
  }

  const expectedSignature = createHmac('sha256', token)
    .update(rawBody)
    .digest();

  const actualSignature = Buffer.from(receivedSignature, 'hex');

  return timingSafeEqual(expectedSignature, actualSignature);
};
