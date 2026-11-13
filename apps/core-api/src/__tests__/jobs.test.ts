import { jobs, newId, tags, withOrg } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { defineJob, enqueueJob, processJobs, retryDeadJobs } from '~/modules/jobs/jobs';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, useTestDatabase } from './db';

const jobRow = async (id: string) => {
  const [row] = await adminDb().select().from(jobs).where(eq(jobs.id, id));

  return row;
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

  /** Enqueues a job in its own transaction and returns its id. */
  const enqueued = async (queue: string, options: { maxAttempts?: number; runAt?: Date } = {}) => {
    const id = await withOrg(orgId, (tx) => enqueueJob(tx, { orgId, queue, ...options }));

    if (id === null) throw new Error(`${queue} was not enqueued`);

    return id;
  };

  it('never runs a job enqueued in a transaction that rolled back; dedupes by key', async () => {
    const ran: string[] = [];

    const echo = defineJob({
      queue: 'test.echo',
      payload: z.object({ name: z.string() }),
      handle: async (job) => {
        ran.push(job.payload.name);
      },
    });

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

    await processJobs([echo]);
    expect(ran).toEqual(['once']);
  });

  it('runs a job again exactly once when its worker died, and rolls back an atomic job that failed', async () => {
    const id = await enqueued('test.crash');
    let runs = 0;

    const crash = {
      queue: 'test.crash',
      handle: async () => {
        runs += 1;
      },
    };

    // A worker claimed it and died: the lease ran out.
    await adminDb().execute(
      sql`update core_jobs set status = 'running', attempts = 1, locked_until = now() - interval '1 second' where id = ${id}`,
    );
    await processJobs([crash]);
    await processJobs([crash]);
    expect(runs).toBe(1);
    expect(await jobRow(id)).toBeUndefined();

    // Atomic: the tag the failing handler wrote is rolled back with it.
    const tagId = newId();
    const failing = await enqueued('test.atomic', { maxAttempts: 2 });

    const atomic = defineJob({
      queue: 'test.atomic',
      payload: z.object({}),
      atomic: true,
      backoff: () => 0,
      handle: async (_job, tx) => {
        await tx.insert(tags).values({ id: tagId, orgId, type: 'customer', name: 'half-done' });
        throw new Error('broke after writing');
      },
    });

    await processJobs([atomic]);
    await processJobs([atomic]);

    expect(await adminDb().select().from(tags).where(eq(tags.id, tagId))).toEqual([]);
    expect(await jobRow(failing)).toMatchObject({
      status: 'dead',
      attempts: 2,
      lastError: 'broke after writing',
    });

    await withOrg(orgId, (tx) => retryDeadJobs(tx, [failing]));
    expect(await jobRow(failing)).toMatchObject({ status: 'queued' });
  });

  it('waits for run_at', async () => {
    let runs = 0;
    const id = await enqueued('test.later', { runAt: new Date(Date.now() + 60_000) });

    await processJobs([
      {
        queue: 'test.later',
        handle: async () => {
          runs += 1;
        },
      },
    ]);
    expect(runs).toBe(0);
    expect(await jobRow(id)).toMatchObject({ status: 'queued' });
  });
});
