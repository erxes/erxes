import { beforeAll, expect, it } from 'vitest';
import { adminDb, describeWithDb, useTestDatabase } from './db';

describeWithDb('job queue', () => {
  useTestDatabase();

  let orgId = '';

  beforeAll(async () => {
    const { createOrganization } = await import('~/modules/organizations/organizations.service');

    orgId = (await createOrganization({ subdomain: 'acme', name: 'Acme', owner: { email: 'o@acme.mn' } })).organization.id;
  });

  const jobRow = async (id: string) => {
    const { jobs } = await import('@erxes/core-db');
    const { eq } = await import('drizzle-orm');
    const [row] = await adminDb().select().from(jobs).where(eq(jobs.id, id));

    return row;
  };

  it('never runs a job enqueued in a transaction that rolled back; dedupes by key', async () => {
    const { withOrg } = await import('@erxes/core-db');
    const { enqueueJob, processJobs } = await import('~/modules/jobs/jobs');
    const ran: string[] = [];
    const definition = { queue: 'test.echo', handle: async (job: { payload: Record<string, unknown> }) => void ran.push(job.payload.name as string) };

    await withOrg(orgId, async (tx) => {
      await enqueueJob(tx, { orgId, queue: 'test.echo', payload: { name: 'rolled back' } });
      throw new Error('roll back');
    }).catch(() => undefined);
    await withOrg(orgId, async (tx) => {
      await enqueueJob(tx, { orgId, queue: 'test.echo', payload: { name: 'once' }, dedupeKey: 'k1' });
      expect(await enqueueJob(tx, { orgId, queue: 'test.echo', payload: { name: 'twice' }, dedupeKey: 'k1' })).toBeNull();
    });

    await processJobs([definition as never]);
    expect(ran).toEqual(['once']);
  });

  it('runs a job again exactly once when its worker died, and rolls back an atomic job that failed', async () => {
    const { withOrg, tags, newId } = await import('@erxes/core-db');
    const { eq, sql } = await import('drizzle-orm');
    const { enqueueJob, processJobs } = await import('~/modules/jobs/jobs');
    const id = (await withOrg(orgId, (tx) => enqueueJob(tx, { orgId, queue: 'test.crash' })))!;
    let runs = 0;

    // A worker claimed it and died: the lease ran out.
    await adminDb().execute(sql`update core_jobs set status = 'running', attempts = 1, locked_until = now() - interval '1 second' where id = ${id}`);
    await processJobs([{ queue: 'test.crash', handle: async () => void (runs += 1) }]);
    await processJobs([{ queue: 'test.crash', handle: async () => void (runs += 1) }]);
    expect(runs).toBe(1);
    expect(await jobRow(id)).toBeUndefined();

    // Atomic: the tag the failing handler wrote is rolled back with it.
    const tagId = newId();
    const failing = (await withOrg(orgId, (tx) => enqueueJob(tx, { orgId, queue: 'test.atomic', maxAttempts: 2 })))!;
    const definition = {
      queue: 'test.atomic',
      atomic: true,
      backoff: () => 0,
      handle: async (_job: unknown, tx: any) => {
        await tx.insert(tags).values({ id: tagId, orgId, type: 'customer', name: 'half-done' });
        throw new Error('broke after writing');
      },
    };

    await processJobs([definition as never]);
    await processJobs([definition as never]);

    expect(await adminDb().select().from(tags).where(eq(tags.id, tagId))).toEqual([]);
    expect(await jobRow(failing)).toMatchObject({ status: 'dead', attempts: 2, lastError: 'broke after writing' });

    const { retryDeadJobs } = await import('~/modules/jobs/jobs');

    await withOrg(orgId, (tx) => retryDeadJobs(tx, orgId, [failing]));
    expect(await jobRow(failing)).toMatchObject({ status: 'queued' });
  });

  it('waits for run_at', async () => {
    const { withOrg } = await import('@erxes/core-db');
    const { enqueueJob, processJobs } = await import('~/modules/jobs/jobs');
    let runs = 0;
    const id = (await withOrg(orgId, (tx) => enqueueJob(tx, { orgId, queue: 'test.later', runAt: new Date(Date.now() + 60_000) })))!;

    await processJobs([{ queue: 'test.later', handle: async () => void (runs += 1) }]);
    expect(runs).toBe(0);
    expect(await jobRow(id)).toMatchObject({ status: 'queued' });
  });
});
