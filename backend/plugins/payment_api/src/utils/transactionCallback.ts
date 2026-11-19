import { randomUUID } from 'crypto';
import { redis, sendWorkerQueue } from 'erxes-api-shared/utils';

// While one request is handing a transaction off. If that request dies before
// the job is queued, the lease runs out and a provider retry can send it.
const LEASE_TTL = 60;
// After the queue accepted the job, retries must not send it again
const DONE_TTL = 30 * 24 * 60 * 60;
const DONE = 'done';

const handoffKey = (transactionId: string) =>
  `payment:transactionCallback:${transactionId}`;

// Deletes the key only if it still holds this request's lease
const RELEASE_OWN_LEASE = `
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
end
return 0`;

/**
 * Sends `transactionCallback` to the plugin that owns the invoice, at most
 * once per transaction. Providers retry callbacks, and Golomt also pushes
 * notifications, so a paid transaction can be reported several times.
 *
 * Call it only after resolving the owning plugin and checking it is enabled,
 * so an unavailable plugin never holds the hand-off.
 *
 * The job is only queued here (not awaited), so "accepted by the queue" is
 * unambiguous: if `add` fails the lease is released for a retry; once `add`
 * succeeds the transaction is marked done. Returns whether this call sent it.
 */
export const sendTransactionCallbackOnce = async ({
  subdomain,
  pluginName,
  transactionId,
  data,
}: {
  subdomain: string;
  pluginName: string;
  transactionId: string;
  data: Record<string, unknown>;
}) => {
  const key = handoffKey(transactionId);
  const lease = `processing:${randomUUID()}`;

  const acquired =
    (await redis.set(key, lease, 'EX', LEASE_TTL, 'NX')) === 'OK';

  // Already sent, or another request is sending it right now
  if (!acquired) {
    return false;
  }

  try {
    await sendWorkerQueue(pluginName, 'payments').add('transactionCallback', {
      subdomain,
      data,
    });
  } catch (e) {
    // Not accepted: free this request's lease so a retry can send it
    await redis.eval(RELEASE_OWN_LEASE, 1, key, lease);
    throw e;
  }

  await redis.set(key, DONE, 'EX', DONE_TTL);

  return true;
};
