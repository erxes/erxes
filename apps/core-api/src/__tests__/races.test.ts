import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';

/**
 * Races from the Phase 1 brief, each run with both sides at once against
 * real Postgres, asserting the final state.
 */
describeWithDb('concurrent writes', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let orgId = '';
  let ownerA = '';
  let ownerB = '';

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  const token = (userId: string) => currentToken(userId, orgId);

  beforeAll(async () => {
    const { users, newId } = await import('@erxes/core-db');

    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'a@acme.mn' },
    });

    orgId = acme.organization.id;
    ownerA = acme.owner.id;
    ownerB = newId();
    await adminDb()
      .insert(users)
      .values({ id: ownerB, orgId, email: 'b@acme.mn', role: 'owner', status: 'active' });
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('two owners demoting each other at once: one wins, the organisation keeps an owner', async () => {
    const [a, b] = [await token(ownerA), await token(ownerB)];

    const results = await Promise.all([
      call(a, 'PATCH', `/users/${ownerB}`, { role: 'member' }),
      call(b, 'PATCH', `/users/${ownerA}`, { role: 'member' }),
    ]);

    expect(results.filter((result) => result.status === 200)).toHaveLength(1);

    const { users } = await import('@erxes/core-db');
    const { and, eq } = await import('drizzle-orm');

    const owners = await adminDb()
      .select()
      .from(users)
      .where(and(eq(users.orgId, orgId), eq(users.role, 'owner')));

    expect(owners).toHaveLength(1);

    // Back to two owners for the next tests.
    const remaining = owners[0]!.id;
    const other = remaining === ownerA ? ownerB : ownerA;

    await call(await token(remaining), 'PATCH', `/users/${other}`, { role: 'owner' });
  });

  it('two owners disabling each other at once: never zero active owners', async () => {
    const [a, b] = [await token(ownerA), await token(ownerB)];

    const results = await Promise.all([
      call(a, 'POST', `/users/${ownerB}/disable`),
      call(b, 'POST', `/users/${ownerA}/disable`),
    ]);

    expect(results.filter((result) => result.status === 200).length).toBeLessThanOrEqual(1);

    const { users } = await import('@erxes/core-db');
    const { and, eq } = await import('drizzle-orm');

    const active = await adminDb()
      .select()
      .from(users)
      .where(and(eq(users.orgId, orgId), eq(users.role, 'owner'), eq(users.status, 'active')));

    expect(active.length).toBeGreaterThanOrEqual(1);

    for (const id of [ownerA, ownerB]) {
      if (!active.some((user) => user.id === id))
        await call(await token(active[0]!.id), 'POST', `/users/${id}/enable`);
    }
  });

  it('two edits of different custom fields at once: both are kept', async () => {
    const owner = await token(ownerA);

    const first = await call(owner, 'POST', '/fields', {
      contentType: 'customer',
      label: 'Shoe size',
      type: 'number',
    });

    const second = await call(owner, 'POST', '/fields', {
      contentType: 'customer',
      label: 'Nickname',
      type: 'text',
    });

    const customer = await call(owner, 'POST', '/customers', { firstName: 'Bat' });

    for (let round = 0; round < 3; round += 1) {
      await Promise.all([
        call(owner, 'PATCH', `/customers/${customer.body.id}`, {
          customFields: { [first.body.id]: 40 + round },
        }),
        call(owner, 'PATCH', `/customers/${customer.body.id}`, {
          customFields: { [second.body.id]: `bat-${round}` },
        }),
      ]);

      const saved = await call(owner, 'GET', `/customers/${customer.body.id}`);

      expect(saved.body.customFields).toEqual({
        [first.body.id]: 40 + round,
        [second.body.id]: `bat-${round}`,
      });
    }
  });

  const startUpload = async (owner: string, bytes: Buffer) => {
    const started = await call(owner, 'POST', '/files', {
      name: 'a.txt',
      contentType: 'text/plain',
      size: bytes.length,
    });

    const put = await fetch(`${base}${started.body.upload.url}`, {
      method: 'PUT',
      headers: started.body.upload.headers,
      body: bytes,
    });

    expect(put.status).toBe(204);

    return started.body as {
      file: { id: string };
      upload: { url: string; headers: Record<string, string> };
    };
  };

  const fileRow = async (id: string) => {
    const { files } = await import('@erxes/core-db');
    const { eq } = await import('drizzle-orm');
    const [row] = await adminDb().select().from(files).where(eq(files.id, id));

    return row;
  };

  it('completes an upload once, however often it is asked; checked bytes can not be replaced', async () => {
    const owner = await token(ownerA);
    const bytes = Buffer.from('checked bytes');
    const started = await startUpload(owner, bytes);

    const results = await Promise.all(
      [1, 2, 3].map(() => call(owner, 'POST', `/files/${started.file.id}/complete`)),
    );

    expect(results.map((result) => result.status)).toEqual([200, 200, 200]);
    expect(results.every((result) => result.body.status === 'ready')).toBe(true);

    const audit = await call(owner, 'GET', `/audit?action=file.uploaded`);

    expect(
      audit.body.data.filter((entry: { targetId: string }) => entry.targetId === started.file.id),
    ).toHaveLength(1);

    // The upload link can't put other bytes behind the ready file.
    const again = await fetch(`${base}${started.upload.url}`, {
      method: 'PUT',
      headers: started.upload.headers,
      body: Buffer.from('evil bytes!!!'),
    });

    const row = await fileRow(started.file.id);
    const { storage } = await import('~/modules/files/storage');
    const { readFile } = await import('node:fs/promises');
    const { localPath } = await import('~/modules/files/storage');

    expect(row!.key.startsWith('uploads/')).toBe(false);
    expect((await readFile(localPath(row!.key))).toString()).toBe('checked bytes');
    expect(await storage().stat(row!.key)).toMatchObject({ size: bytes.length });
    expect([204, 409]).toContain(again.status);
  });

  it('cleanup and completion at once: the file ends ready with its bytes, or gone — never ready without them', async () => {
    const owner = await token(ownerA);
    const { pruneUploads } = await import('~/modules/files/files.service');
    const { withSystem } = await import('@erxes/core-db');
    const { storage } = await import('~/modules/files/storage');

    for (let round = 0; round < 4; round += 1) {
      const started = await startUpload(owner, Buffer.from(`round ${round}`));

      const [completed] = await Promise.all([
        call(owner, 'POST', `/files/${started.file.id}/complete`),
        // Everything pending counts as stale here.
        withSystem('test cleanup', (tx) => pruneUploads(tx, 0)),
      ]);

      const row = await fileRow(started.file.id);

      if (row?.status === 'ready') {
        expect(completed.status).toBe(200);
        expect(await storage().stat(row.key)).not.toBeNull();
      } else {
        expect(completed.status).not.toBe(200);
      }
    }
  });

  it('keeps a deleted file as a tombstone until storage confirms, then purges it', async () => {
    const owner = await token(ownerA);
    const started = await startUpload(owner, Buffer.from('to delete'));

    await call(owner, 'POST', `/files/${started.file.id}/complete`);

    const { setStorage, storage } = await import('~/modules/files/storage');
    const { purgeDeletedFiles } = await import('~/modules/files/files.service');
    const { withSystem } = await import('@erxes/core-db');
    const real = storage();
    const key = (await fileRow(started.file.id))!.key;

    expect((await call(owner, 'DELETE', `/files/${started.file.id}`)).status).toBe(200);
    expect((await call(owner, 'GET', `/files/${started.file.id}`)).status).toBe(404);

    // Storage is down: the tombstone stays for the next run.
    setStorage({ ...real, remove: () => Promise.reject(new Error('storage is down')) });
    expect(await withSystem('test purge', (tx) => purgeDeletedFiles(tx))).toBe(0);
    expect((await fileRow(started.file.id))?.status).toBe('deleting');
    expect(await real.stat(key)).not.toBeNull();

    setStorage(real);
    expect(await withSystem('test purge', (tx) => purgeDeletedFiles(tx))).toBeGreaterThanOrEqual(1);
    expect(await fileRow(started.file.id)).toBeUndefined();
    expect(await real.stat(key)).toBeNull();
  });

  it('collapses concurrent edit notifications without losing a change', async () => {
    const { notify } = await import('~/modules/notifications/notifications.service');
    const { withOrg } = await import('@erxes/core-db');
    const caller = { orgId, actorType: 'user' as const, actorId: ownerA, source: 'core' };

    const send = (field: string) =>
      withOrg(orgId, (tx) =>
        notify(tx, caller, {
          userIds: [ownerB],
          kind: 'core.customer.updated',
          title: 'Updated',
          entity: { type: 'customer', id: 'c-collapse' },
          collapseMinutes: 30,
          data: { changes: { [field]: ['old', 'new'] } },
        }),
      );

    await send('firstName');
    await Promise.all(['lastName', 'primaryEmail', 'primaryPhone', 'description'].map(send));

    const { notifications } = await import('@erxes/core-db');
    const { eq } = await import('drizzle-orm');

    const rows = await adminDb()
      .select()
      .from(notifications)
      .where(eq(notifications.entityId, 'c-collapse'));

    expect(rows).toHaveLength(1);
    expect(
      Object.keys((rows[0]!.data as { changes: Record<string, unknown> }).changes).sort(),
    ).toEqual(['description', 'firstName', 'lastName', 'primaryEmail', 'primaryPhone']);
  });
});
