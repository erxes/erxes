import Redis from 'ioredis';

/**
 * Runs the tenant slot script against a real Redis when one is given
 * (DATA_EXTENSIONS_TEST_REDIS=redis://localhost:6379); skipped otherwise.
 */
const url = process.env.DATA_EXTENSIONS_TEST_REDIS;
const redis = url ? new Redis(url) : undefined;

jest.mock('erxes-api-shared/utils', () => ({
  createMQWorkerWithListeners: jest.fn(),
  redis,
}));
jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('@/data-extensions/changes', () => ({
  attemptWebhookDelivery: jest.fn(),
  WEBHOOK_ATTEMPTS: 6,
  WEBHOOK_QUEUE: { service: 'dataextensions', name: 'webhooks' },
}));

import {
  releaseTenantSlot,
  takeTenantSlot,
  TENANT_CONCURRENCY,
} from './worker';

const tenant = `slot-test-${process.pid}`;
const key = `dataextensions:webhooks:in-flight:${tenant}`;

(url ? describe : describe.skip)('tenant webhook slots', () => {
  beforeEach(() => redis?.del(key));
  afterAll(async () => {
    await redis?.del(key);
    redis?.disconnect();
  });

  it(`lets one tenant hold ${TENANT_CONCURRENCY} deliveries at a time`, async () => {
    for (let i = 0; i < TENANT_CONCURRENCY; i += 1) {
      expect(await takeTenantSlot(tenant, `job-${i}`)).toBe(true);
    }

    expect(await takeTenantSlot(tenant, 'job-extra')).toBe(false);
    expect(await takeTenantSlot(`${tenant}-other`, 'job-0')).toBe(true);
    await redis?.del(`${key}-other`);

    await releaseTenantSlot(tenant, 'job-0');
    expect(await takeTenantSlot(tenant, 'job-extra')).toBe(true);
  });

  it('keeps a slot for a job that asks again', async () => {
    expect(await takeTenantSlot(tenant, 'job-a')).toBe(true);
    expect(await takeTenantSlot(tenant, 'job-a')).toBe(true);
    expect(await redis?.zcard(key)).toBe(1);
  });

  it('reclaims slots whose holder stopped a minute ago', async () => {
    const old = Date.now() - 61_000;

    for (let i = 0; i < TENANT_CONCURRENCY; i += 1) {
      await redis?.zadd(key, old, `dead-${i}`);
    }

    expect(await takeTenantSlot(tenant, 'job-new')).toBe(true);
    expect(await redis?.zcard(key)).toBe(1);
  });

  it('lets the slot set expire', async () => {
    await takeTenantSlot(tenant, 'job-a');

    expect(await redis?.pttl(key)).toBeGreaterThan(55_000);
  });
});
