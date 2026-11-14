import { newId, tags, withOrg } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { failedJobs, retryJobs } from '~/modules/jobs/failed';
import { addQueues, defineJob } from '~/modules/jobs/jobs';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';
import { makeDue, settle } from './settle';

const jobRow = async (id: string | null) => {
  const { rows } = await adminDb().execute<{ state: string; attempts: number; error: string }>(sql`
    select state::text, retry_count + 1 as attempts, output->>'message' as error
    from core_queue.job where id = ${id}::uuid
  `);

  return rows[0];
};

/** A job of its own queue, created for the test. */
const testJob = async (definition: Parameters<typeof defineJob>[0]) => {
  const job = defineJob(definition);

  await addQueues(job.queues, { schedule: false });

  return job;
};

describe('job queue', () => {
  useTestDatabase();

  let orgId = '';

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    orgId = acme.organization.id;
  });

  it('never runs a job enqueued in a transaction that rolled back; dedupes by key', async () => {
    const ran: string[] = [];

    const echo = defineJob({
      queue: 'test.echo',
      payload: z.object({ name: z.string() }),
      handle: async (job) => {
        ran.push(job.payload.name);
      },
    });

    // Its own payload type, so not through testJob().
    await addQueues(echo.queues, { schedule: false });

    await expect(
      withOrg(orgId, async (tx) => {
        await echo.enqueue(tx, { orgId, payload: { name: 'rolled back' } });
        throw new Error('roll back');
      }),
    ).rejects.toThrow('roll back');
    await withOrg(orgId, async (tx) => {
      await echo.enqueue(tx, { orgId, payload: { name: 'once' }, dedupeKey: 'k1' });
      expect(
        await echo.enqueue(tx, { orgId, payload: { name: 'twice' }, dedupeKey: 'k1' }),
      ).toBeNull();
    });

    await settle();
    expect(ran).toEqual(['once']);
  });

  it('rolls back an atomic job that failed, keeps it failed after its last attempt, retries it on request', async () => {
    const tagId = newId();

    const atomic = await testJob({
      queue: 'test.atomic',
      payload: z.object({}),
      atomic: true,
      retry: { attempts: 2 },
      handle: async (_job, tx) => {
        await tx.insert(tags).values({ id: tagId, orgId, type: 'customer', name: 'half-done' });
        throw new Error('broke after writing');
      },
    });

    const id = await withOrg(orgId, (tx) => atomic.enqueue(tx, { orgId, payload: {} }));

    await settle();
    await makeDue();
    await settle();

    expect(await adminDb().select().from(tags).where(eq(tags.id, tagId))).toEqual([]);
    expect(await jobRow(id)).toEqual({
      state: 'failed',
      attempts: 2,
      error: 'broke after writing',
    });

    await withOrg(orgId, async (tx) =>
      retryJobs(tx, await failedJobs(tx, 'test.atomic', { state: 'failed', limit: 10 })),
    );
    expect((await jobRow(id))?.state).toBe('retry');
  });

  it('rolls back an atomic job whose attempt ended while it ran', async () => {
    const tagId = newId();
    let runs = 0;

    const atomic = await testJob({
      queue: 'test.ended',
      payload: z.object({}),
      atomic: true,
      retry: { attempts: 1 },
      handle: async (job, tx) => {
        runs += 1;
        await tx.insert(tags).values({ id: tagId, orgId, type: 'customer', name: 'too late' });
        // Its time ran out meanwhile: pg-boss failed it from elsewhere.
        await adminDb().execute(
          sql`update core_queue.job set state = 'failed' where id = ${job.id}::uuid`,
        );
      },
    });

    await withOrg(orgId, (tx) => atomic.enqueue(tx, { orgId, payload: {} }));
    await settle();

    expect(runs).toBe(1);
    expect(await adminDb().select().from(tags).where(eq(tags.id, tagId))).toEqual([]);
  });

  it('waits for runAt', async () => {
    let runs = 0;

    const later = await testJob({
      queue: 'test.later',
      payload: z.object({}),
      handle: async () => {
        runs += 1;
      },
    });

    const id = await withOrg(orgId, (tx) =>
      later.enqueue(tx, { orgId, payload: {}, runAt: new Date(Date.now() + 60_000) }),
    );

    await settle();
    expect(runs).toBe(0);
    expect((await jobRow(id))?.state).toBe('created');
  });
});
