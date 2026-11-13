import { files, jobs, newId, tags, withOrg, withSystem } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import {
  pruneUploads,
  purgeDeletedFiles,
  readFileBytes,
} from '~/modules/files/files.service';
import { setStorage, storage } from '~/modules/files/storage';
import { enqueueJob, type JobDefinition, processJobs } from '~/modules/jobs/jobs';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/**
 * The orderings the TLA+ models in verify/tla check, replayed against real
 * Postgres with each racing step held open until the other has run. Each test
 * names the model property it stands for.
 */

/** A promise someone else resolves: `open()` lets whoever awaits `opened` go on. */
const gate = () => {
  let open = () => {};

  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });

  return { open, opened };
};

const fileRow = async (id: string) => {
  const [row] = await adminDb().select().from(files).where(eq(files.id, id));

  return row;
};

const jobRow = async (id: string) => {
  const [row] = await adminDb().select().from(jobs).where(eq(jobs.id, id));

  return row;
};

/** Resolves once some statement in the test database waits for a row lock. */
const someoneWaitsForALock = async () => {
  for (let tries = 0; tries < 200; tries += 1) {
    const { rows } = await adminDb().execute<{ waiting: number }>(
      sql`select count(*)::int as waiting from pg_stat_activity
          where datname = current_database() and wait_event_type = 'Lock'`,
    );

    if ((rows[0]?.waiting ?? 0) > 0) return;

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error('no statement waited for a row lock');
};

/** Stops every completion inside storage().promote until `release()`. */
const holdPromote = () => {
  const real = storage();
  const entered = gate();
  const release = gate();

  setStorage({
    ...real,
    async promote(from, to, seen) {
      entered.open();
      await release.opened;

      return real.promote(from, to, seen);
    },
  });

  return { entered: entered.opened, release: release.open, restore: () => setStorage(real) };
};

describe('concurrency', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** Starts an upload and sends its bytes. */
  const startUpload = async (bytes: Buffer) => {
    const started = await t
      .owner()
      .files.createUpload({ name: 'a.txt', contentType: 'text/plain', size: bytes.length });

    const put = await fetch(t.url(started.upload.url), {
      method: 'PUT',
      headers: started.upload.headers,
      body: bytes,
    });

    expect(put.status).toBe(204);

    return started.file;
  };

  describe('file lifecycle (verify/tla/FileLifecycle.tla)', () => {
    it('CompletionOwnsItsRow, DownloadsServeChecked: the prune skips a file being completed, and nobody reads it before it is ready', async () => {
      const file = await startUpload(Buffer.from('checked bytes'));
      const hold = holdPromote();

      try {
        const completing = t.owner().files.complete({ id: file.id });

        await hold.entered;

        // The completion holds the row lock between stat and promote.
        expect(await withSystem('test prune', (tx) => pruneUploads(tx, 0))).toBe(0);
        expect(await fileRow(file.id)).toMatchObject({ status: 'pending' });
        expect(await t.owner().files.get({ id: file.id })).toMatchObject({ downloadUrl: null });
        await expect(readFileBytes(t.ids.org, file.id)).rejects.toMatchObject({ status: 404 });

        hold.release();
        expect(await completing).toMatchObject({ status: 'ready' });
      } finally {
        hold.restore();
      }

      const { row, body } = await readFileBytes(t.ids.org, file.id);

      expect(body.toString()).toBe('checked bytes');
      expect(row.key.startsWith('uploads/')).toBe(false);
    });

    it('NoBytesDeletedUnderLiveRecord, ReadyHasCheckedBytes: a delete during a completion waits for it, and the bytes go only with the record', async () => {
      const file = await startUpload(Buffer.from('to delete'));
      const hold = holdPromote();

      try {
        const completing = t.owner().files.complete({ id: file.id });

        await hold.entered;

        const removing = t.owner().files.remove({ id: file.id });

        await someoneWaitsForALock();
        // Nothing is deleting yet, so the purge has nothing to remove.
        expect(await purgeDeletedFiles()).toBe(0);

        hold.release();
        expect(await completing).toMatchObject({ status: 'ready' });
        expect(await removing).toEqual({ ok: true });
      } finally {
        hold.restore();
      }

      // The tombstone points at the key the completion committed, bytes still there.
      const tombstone = await fileRow(file.id);

      expect(tombstone).toMatchObject({ status: 'deleting' });
      expect(tombstone?.key.startsWith('uploads/')).toBe(false);
      expect(await storage().stat(tombstone?.key ?? '')).toMatchObject({ size: 9 });

      expect(await purgeDeletedFiles()).toBe(1);
      expect(await fileRow(file.id)).toBeUndefined();
      expect(await storage().stat(tombstone?.key ?? '')).toBeNull();
    });
  });

  describe('job queue (verify/tla/Jobs.tla)', () => {
    const enqueue = (queue: string, maxAttempts?: number) =>
      withOrg(t.ids.org, async (tx) => {
        const id = await enqueueJob(tx, { orgId: t.ids.org, queue, maxAttempts });

        if (id === null) throw new Error(`${queue} was not enqueued`);

        return id;
      });

    /** Time passes beyond the job's lease, as for a worker that hangs or died. */
    const leaseRunsOut = (id: string) =>
      adminDb().execute(
        sql`update core_jobs set locked_until = now() - interval '1 second' where id = ${id}`,
      );

    it('EnqueueFollowsTransaction, NeverLost, AtLeastOnce: workers see a job only once its transaction commits, then run it once', async () => {
      let runs = 0;

      const definition: JobDefinition = {
        queue: 'test.commit',
        handle: async () => {
          runs += 1;
        },
      };

      const inserted = gate();
      const commit = gate();

      const enqueueing = withOrg(t.ids.org, async (tx) => {
        await enqueueJob(tx, { orgId: t.ids.org, queue: 'test.commit' });
        inserted.open();
        await commit.opened;
      });

      await inserted.opened;
      expect(await processJobs([definition])).toBe(0);

      commit.open();
      await enqueueing;
      expect(await processJobs([definition])).toBe(1);
      expect(runs).toBe(1);

      await expect(
        withOrg(t.ids.org, async (tx) => {
          await enqueueJob(tx, { orgId: t.ids.org, queue: 'test.commit' });
          throw new Error('roll back');
        }),
      ).rejects.toThrow('roll back');
      expect(await processJobs([definition])).toBe(0);
      expect(runs).toBe(1);
    });

    it('LeaseExclusive: a worker whose lease ran out can not release the job the next worker holds', async () => {
      const id = await enqueue('test.stale-fail');
      const first = { in: gate(), go: gate() };
      const second = { in: gate(), go: gate() };

      const definition: JobDefinition = {
        queue: 'test.stale-fail',
        backoff: () => 0,
        handle: async (job) => {
          const step = job.attempts === 1 ? first : second;

          step.in.open();
          await step.go.opened;

          if (step === first) throw new Error('the first worker failed late');
        },
      };

      const firstWorker = processJobs([definition]);

      await first.in.opened;
      await leaseRunsOut(id);

      const secondWorker = processJobs([definition]);

      await second.in.opened;
      first.go.open();
      await firstWorker;

      // Still the second worker's: running, its attempt, its lease.
      const held = await jobRow(id);

      expect(held).toMatchObject({ status: 'running', attempts: 2 });
      expect(held?.lockedUntil?.getTime() ?? 0).toBeGreaterThan(Date.now());
      expect(await processJobs([definition])).toBe(0);

      second.go.open();
      await secondWorker;
      expect(await jobRow(id)).toBeUndefined();
    });

    it('AttemptsBounded, FinishedStaysFinished: a job whose worker stalls on its last attempt goes dead once and stays dead', async () => {
      const id = await enqueue('test.last-attempt', 1);
      const stalled = { in: gate(), go: gate() };
      const dead: string[] = [];
      let runs = 0;

      const definition: JobDefinition = {
        queue: 'test.last-attempt',
        handle: async () => {
          runs += 1;
          stalled.in.open();
          await stalled.go.opened;
        },
        onDead: async (_job, error) => {
          dead.push(error);
        },
      };

      const stalledWorker = processJobs([definition]);

      await stalled.in.opened;
      await leaseRunsOut(id);

      expect(await processJobs([definition])).toBe(0);
      expect(await jobRow(id)).toMatchObject({ status: 'dead', attempts: 1 });
      expect(dead).toHaveLength(1);

      // The stalled worker finishes after all: the dead job stays dead.
      stalled.go.open();
      await stalledWorker;
      expect(await processJobs([definition])).toBe(0);
      expect(await jobRow(id)).toMatchObject({ status: 'dead', attempts: 1 });
      expect({ runs, dead: dead.length }).toEqual({ runs: 1, dead: 1 });
    });

    it('LeaseExclusive, atomic jobs: a worker that lost its lease rolls its writes back, the next one commits', async () => {
      const id = await enqueue('test.stale-atomic');
      const tagIds = [newId(), newId()];
      const first = { in: gate(), go: gate() };
      const second = { in: gate(), go: gate() };

      const definition: JobDefinition = {
        queue: 'test.stale-atomic',
        atomic: true,
        handle: async (job, tx) => {
          const step = job.attempts === 1 ? first : second;

          await tx.insert(tags).values({
            id: tagIds[job.attempts - 1] ?? newId(),
            orgId: t.ids.org,
            type: 'customer',
            name: `attempt ${job.attempts}`,
          });
          step.in.open();
          await step.go.opened;
        },
      };

      const firstWorker = processJobs([definition]);

      await first.in.opened;
      await leaseRunsOut(id);

      const secondWorker = processJobs([definition]);

      await second.in.opened;
      first.go.open();
      await firstWorker;
      second.go.open();
      await secondWorker;

      const written = await adminDb()
        .select({ name: tags.name })
        .from(tags)
        .where(sql`${tags.id} in (${sql.join(tagIds, sql`, `)})`);

      expect(written).toEqual([{ name: 'attempt 2' }]);
      expect(await jobRow(id)).toBeUndefined();
    });
  });
});
