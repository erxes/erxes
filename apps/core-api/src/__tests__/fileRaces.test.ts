import { files, withSystem } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import { expect, it } from 'vite-plus/test';
import { pruneUploads, purgeDeletedFiles } from '~/modules/files/files.service';
import { localPath, setStorage, storage } from '~/modules/files/storage';
import { adminDb, describeWithDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const fileRow = async (id: string) => {
  const [row] = await adminDb().select().from(files).where(eq(files.id, id));

  if (!row) throw new Error(`file ${id} is gone`);

  return row;
};

const fileExists = async (id: string) =>
  (await adminDb().select().from(files).where(eq(files.id, id))).length > 0;

/** Uploads racing completion, cleanup and deletion, against real Postgres and local storage. */
describeWithDb('concurrent file writes', () => {
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

    return started;
  };

  it('completes an upload once, however often it is asked; checked bytes can not be replaced', async () => {
    const bytes = Buffer.from('checked bytes');
    const started = await startUpload(bytes);
    const { id } = started.file;
    const completed = await Promise.all([1, 2, 3].map(() => t.owner().files.complete({ id })));

    expect(completed.map((file) => file.status)).toEqual(['ready', 'ready', 'ready']);

    const audit = await t.owner().audit.list({ action: 'file.uploaded' });

    expect(audit.data.filter((entry) => entry.targetId === id)).toHaveLength(1);

    // The upload link can't put other bytes behind the ready file.
    const again = await fetch(t.url(started.upload.url), {
      method: 'PUT',
      headers: started.upload.headers,
      body: Buffer.from('evil bytes!!!'),
    });

    const { key } = await fileRow(id);

    expect(key.startsWith('uploads/')).toBe(false);
    expect((await readFile(localPath(key))).toString()).toBe('checked bytes');
    expect(await storage().stat(key)).toMatchObject({ size: bytes.length });
    expect([204, 409]).toContain(again.status);
  });

  it('cleanup and completion at once: the file ends ready with its bytes, or gone, never ready without them', async () => {
    for (let round = 0; round < 4; round += 1) {
      const { file } = await startUpload(Buffer.from(`round ${round}`));

      const [completed] = await Promise.allSettled([
        t.owner().files.complete({ id: file.id }),
        // Everything pending counts as stale here.
        withSystem('test cleanup', (tx) => pruneUploads(tx, 0)).then(() => purgeDeletedFiles()),
      ]);

      const [row] = await adminDb().select().from(files).where(eq(files.id, file.id));
      const ready = row?.status === 'ready';

      const outcome = {
        ready,
        answer: completed.status,
        bytes: ready && (await storage().stat(row.key)) !== null,
      };

      expect([
        { ready: true, answer: 'fulfilled', bytes: true },
        { ready: false, answer: 'rejected', bytes: false },
      ]).toContainEqual(outcome);
    }
  });

  it('keeps a deleted file as a tombstone until storage confirms, then purges it', async () => {
    const { file } = await startUpload(Buffer.from('to delete'));

    await t.owner().files.complete({ id: file.id });

    const real = storage();
    const { key } = await fileRow(file.id);

    await t.owner().files.remove({ id: file.id });
    await expect(t.owner().files.get({ id: file.id })).rejects.toMatchObject({ status: 404 });

    // Storage is down: the tombstone stays for the next run.
    setStorage({ ...real, remove: () => Promise.reject(new Error('storage is down')) });
    expect(await purgeDeletedFiles()).toBe(0);
    expect((await fileRow(file.id)).status).toBe('deleting');
    expect(await real.stat(key)).not.toBeNull();

    setStorage(real);
    expect(await purgeDeletedFiles()).toBeGreaterThanOrEqual(1);
    expect(await fileExists(file.id)).toBe(false);
    expect(await real.stat(key)).toBeNull();
  });
});
