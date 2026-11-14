import { files, withSystem } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { pruneUploads, purgeDeletedFiles, readFileBytes } from '~/modules/files/files.service';
import { setStorage, storage } from '~/modules/files/storage';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/**
 * The orderings the TLA+ models in verify/tla check, replayed against real
 * Postgres with each racing step held open until the other has run. Each test
 * names the model property it stands for.
 */

/** A promise someone else resolves: `open()` lets whoever awaits `opened` go on. */
const gate = () => {
  let resolve: (() => void) | undefined;

  const opened = new Promise<void>((done) => {
    resolve = done;
  });

  return { open: () => resolve?.(), opened };
};

const fileRow = async (id: string) => {
  const [row] = await adminDb().select().from(files).where(eq(files.id, id));

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
});
