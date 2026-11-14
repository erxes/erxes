import { DelayedError, Job } from 'bullmq';
import { createMQWorkerWithListeners, redis } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import {
  attemptWebhookDelivery,
  IWebhookDelivery,
  WEBHOOK_ATTEMPTS,
  WEBHOOK_QUEUE,
} from '@/data-extensions/changes';

const readNumber = (name: string, fallback: number) => {
  const value = Number(process.env[name]);

  return Number.isInteger(value) && value > 0 ? value : fallback;
};

const WORKER_CONCURRENCY = 10;
/**
 * Deliveries one tenant may have in flight across every replica
 * (DATA_EXTENSIONS_WEBHOOKS_PER_TENANT, default 3), so a tenant whose
 * receiver is slow can't hold all workers while others wait.
 */
export const TENANT_CONCURRENCY = readNumber(
  'DATA_EXTENSIONS_WEBHOOKS_PER_TENANT',
  3,
);
/** A slot whose holder died is reclaimed after this long (> one try). */
const SLOT_STALE_MS = 60_000;
/** A delivery that found its tenant busy waits this long before retrying. */
const BUSY_DELAY_MS = 1_000;

const slotKey = (subdomain: string) =>
  `dataextensions:webhooks:in-flight:${subdomain}`;

// KEYS[1] slot set; ARGV: now, stale before, limit, member, ttl ms
const TAKE_SLOT = `redis.call('zremrangebyscore', KEYS[1], '-inf', ARGV[2])
if redis.call('zscore', KEYS[1], ARGV[4]) then
  return 1
end
if redis.call('zcard', KEYS[1]) >= tonumber(ARGV[3]) then
  return 0
end
redis.call('zadd', KEYS[1], ARGV[1], ARGV[4])
redis.call('pexpire', KEYS[1], ARGV[5])
return 1`;

export const takeTenantSlot = async (subdomain: string, member: string) => {
  const now = Date.now();
  const taken = await redis.eval(
    TAKE_SLOT,
    1,
    slotKey(subdomain),
    now,
    now - SLOT_STALE_MS,
    TENANT_CONCURRENCY,
    member,
    SLOT_STALE_MS,
  );

  return taken === 1;
};

export const releaseTenantSlot = (subdomain: string, member: string) =>
  redis.zrem(slotKey(subdomain), member);

const deliver = async (job: Job<IWebhookDelivery>, token?: string) => {
  const { subdomain } = job.data;
  const member = `${job.id}`;

  if (!(await takeTenantSlot(subdomain, member))) {
    // Back of the line without using up a try.
    await job.moveToDelayed(
      Date.now() + BUSY_DELAY_MS + Math.floor(Math.random() * BUSY_DELAY_MS),
      token,
    );

    throw new DelayedError();
  }

  try {
    const models = await generateModels(subdomain);

    await attemptWebhookDelivery(models, job.data, {
      isLastAttempt:
        job.attemptsMade + 1 >= (job.opts.attempts || WEBHOOK_ATTEMPTS),
    });
  } finally {
    await releaseTenantSlot(subdomain, member).catch(() => undefined);
  }
};

export const initMQWorkers = () =>
  new Promise<void>((resolve) => {
    createMQWorkerWithListeners(
      WEBHOOK_QUEUE.service,
      WEBHOOK_QUEUE.name,
      deliver as (job: Job) => Promise<void>,
      redis,
      resolve,
      { concurrency: WORKER_CONCURRENCY },
    );
  });
