import { redis } from 'erxes-api-shared/utils';

// How long a transaction stays marked as already handed to its owning plugin
const HANDOFF_TTL = 30 * 24 * 60 * 60;

const handoffKey = (transactionId: string) =>
  `payment:transactionCallback:${transactionId}`;

/**
 * Providers retry callbacks, and some (Golomt) also push notifications, so a
 * paid transaction can be reported more than once. Only the caller that gets
 * this claim may send `transactionCallback` to the owning plugin.
 */
export const claimTransactionCallback = async (transactionId: string) =>
  (await redis.set(
    handoffKey(transactionId),
    '1',
    'EX',
    HANDOFF_TTL,
    'NX',
  )) === 'OK';

// Lets a later report retry the hand-off after sending failed
export const releaseTransactionCallback = async (transactionId: string) => {
  await redis.del(handoffKey(transactionId));
};
